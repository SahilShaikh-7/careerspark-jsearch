
import { GoogleGenAI, Type } from '@google/genai';
import { blobToBase64 } from '../utils/helpers';
import { Job } from '../types';

// Add a check for the Gemini API Key.
// In the AI Studio environment, `process.env.API_KEY` is injected.
// This check ensures that the key is present before making any calls.
export const isGeminiConfigured = !!process.env.API_KEY;

// FIX: Initialize the GoogleGenAI client according to the coding guidelines.
// The API key must be provided via the `process.env.API_KEY` environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// JSearch API Configuration
const JSEARCH_PLACEHOLDER = "abdab7afefmsh7a689eed899d741p153425jsne4e416b97f36";
// IMPORTANT: Replace with your actual JSearch API key from RapidAPI if needed.
const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "abdab7afefmsh7a689eed899d741p153425jsne4e416b97f36";
export const isJsearchConfigured = JSEARCH_API_KEY !== JSEARCH_PLACEHOLDER;


const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER, description: 'Overall score for the resume out of 100.' },
    experience_level: { type: Type.STRING, description: "Candidate's experience level (e.g., 'Entry-Level', 'Mid-Level', 'Senior')." },
    total_experience: { type: Type.NUMBER, description: 'Total years of professional experience as a number.' },
    feedback: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 3-5 concise, actionable suggestions to improve the resume.'
    },
    skills: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING, enum: ['technical', 'soft', 'domain'] },
          confidence: { type: Type.NUMBER, description: 'A number between 0 and 1 representing confidence.' }
        },
        required: ['name', 'category', 'confidence']
      }
    },
    job_titles: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'An array of 3-5 suitable job titles based on the resume content.'
    }
  },
  required: ['score', 'experience_level', 'total_experience', 'feedback', 'skills', 'job_titles']
};

/**
 * Analyzes a resume file using the Gemini API.
 * @param file The resume file (PDF or DOCX).
 * @returns An object containing the analysis data or an error.
 */
export const analyzeResume = async (file: File) => {
  if (!isGeminiConfigured) {
    console.error("Gemini API key is missing.");
    return { data: null, error: "AI features are disabled. Please configure your Google Gemini API key to proceed." };
  }
  
  try {
    const base64Data = await blobToBase64(file);
    const filePart = {
      inlineData: {
        mimeType: file.type,
        data: base64Data,
      },
    };

    const textPart = {
      text: `Analyze the attached resume. Extract the following information in JSON format:
1. score: An overall score for the resume out of 100, based on clarity, skills, and experience.
2. experience_level: The candidate's experience level (e.g., 'Entry-Level', 'Mid-Level', 'Senior').
3. total_experience: The total years of professional experience as a number.
4. feedback: An array of 3-5 concise, actionable suggestions to improve the resume.
5. skills: An array of objects, each representing a skill. Each skill object should have 'name' (string), 'category' ('technical', 'soft', or 'domain'), and 'confidence' (a number between 0 and 1 representing your confidence in this skill being present and relevant).
6. job_titles: An array of 3-5 suitable job titles based on the resume content.`
    };
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using a fast and cost-effective model.
      contents: { parts: [filePart, textPart] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        maxOutputTokens: 2048, // Limit tokens for free/limited use.
        thinkingConfig: { thinkingBudget: 512 }, // Reserve tokens for output as per guidelines.
      },
    });

    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);

    return { data, error: null };
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    let errorMessage = 'An unknown error occurred during resume analysis.';
    if (error.message && error.message.toLowerCase().includes('fetch')) {
        errorMessage = 'Failed to connect to the AI service. This is often caused by an invalid or improperly configured Google Gemini API key. Please verify your API key in the environment settings and check your network connection.';
    } else if (error.message) {
        errorMessage = error.message;
    }
    return { data: null, error: errorMessage };
  }
};

/**
 * Finds matching job listings using the JSearch API.
 * @param jobTitles An array of job titles to search for.
 * @returns A promise that resolves to an array of Job objects.
 */
export const findMatchingJobs = async (jobTitles: string[]): Promise<Job[]> => {
    if (!isJsearchConfigured) {
        console.error("JSearch API key is missing. Skipping job search.");
        return [];
    }
    if (!jobTitles || jobTitles.length === 0) {
        return [];
    }

    const query = jobTitles.join(' or ');
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&country=IN&num_pages=1`;
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': JSEARCH_API_KEY,
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`JSearch API request failed with status ${response.status}`);
        }
        const result = await response.json();

        if (!result.data || !Array.isArray(result.data)) {
            console.error("JSearch API returned invalid data format:", result);
            return [];
        }
        
        // Take top 5 results to match previous behavior
        const jobsFromApi = result.data.slice(0, 5);

        const formatSalary = (job: any) => {
            if (job.job_min_salary && job.job_max_salary) {
                return `${job.job_min_salary} - ${job.job_max_salary} ${job.job_salary_currency || ''} ${job.job_salary_period || ''}`.trim();
            }
            return 'Not Disclosed';
        }
        
        const formatExperience = (job: any) => {
            if (job.job_required_experience?.required_experience_in_months) {
                const months = job.job_required_experience.required_experience_in_months;
                if (months >= 12) {
                    const years = Math.floor(months / 12);
                    const remainingMonths = months % 12;
                    return `${years} year${years > 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`: ''}`;
                }
                return `${months} month${months > 1 ? 's' : ''}`;
            }
            return 'Not specified';
        }
        
        const formatJobType = (type: string | null) => {
            if (!type) return 'Full-time';
            return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }

        const matchedJobs: Job[] = jobsFromApi.map((job: any): Job => ({
            title: job.job_title || 'N/A',
            company: job.employer_name || 'N/A',
            location: `${job.job_city || ''}${job.job_city && job.job_state ? ', ' : ''}${job.job_state || ''}`.trim() || 'India',
            match_percentage: Math.floor(70 + Math.random() * 30), // Placeholder
            apply_url: job.job_apply_link || '#',
            description: job.job_description?.substring(0, 200) + '...' || 'No description available.',
            salary_range: formatSalary(job),
            experience_required: formatExperience(job),
            job_type: formatJobType(job.job_employment_type),
        }));

        return matchedJobs;

    } catch (error) {
        console.error("Error finding matching jobs with JSearch:", error);
        return [];
    }
};
