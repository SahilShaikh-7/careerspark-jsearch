import Groq from 'groq-sdk';
import { extractTextFromFile } from '../utils/helpers';
import { Job } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

export const isGroqConfigured = GROQ_API_KEY.trim() !== '';

const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Analyzes a resume file using the Groq API with Llama model.
 * Converts PDF/DOCX to base64 text representation for analysis.
 * @param file The resume file (PDF or DOCX).
 * @returns An object containing the analysis data or an error.
 */
export const analyzeResume = async (file: File) => {
  if (!isGroqConfigured) {
    return { data: null, error: "AI features are disabled. Please configure your Groq API key." };
  }

  try {
    const resumeText = await extractTextFromFile(file);

    const prompt = `You are an expert resume analyst and career advisor. Analyze the following resume text extracted from a ${file.type} file named "${file.name}".

The resume text is:
${resumeText.substring(0, 12000)}

Based on whatever text you can extract or infer from this resume data, provide your analysis in the following JSON format ONLY (no other text):
{
  "score": <number 0-100>,
  "experience_level": "<Entry-Level|Mid-Level|Senior|Executive>",
  "total_experience": <number of years>,
  "feedback": ["<suggestion1>", "<suggestion2>", "<suggestion3>", "<suggestion4>", "<suggestion5>"],
  "skills": [
    {"name": "<skill>", "category": "<technical|soft|domain>", "confidence": <0.0-1.0>}
  ],
  "job_titles": ["<title1>", "<title2>", "<title3>"]
}

Rules:
1. Score based on clarity, formatting, skills coverage, and experience presentation.
2. Provide exactly 5 actionable feedback suggestions.
3. Extract at least 8-15 skills with accurate categories and confidence.
4. Suggest 3-5 suitable job titles for the Indian job market.
5. Return ONLY valid JSON, no markdown, no code blocks.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume analyzer. Always respond with valid JSON only. No markdown formatting, no code blocks, just raw JSON.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const jsonString = response.choices[0]?.message?.content?.trim() || '';
    const data = JSON.parse(jsonString);

    return { data, error: null };
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    let errorMessage = 'An unknown error occurred during resume analysis.';
    if (error.message?.includes('401') || error.message?.includes('authentication')) {
      errorMessage = 'Invalid Groq API key. Please check your configuration.';
    } else if (error.message?.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { data: null, error: errorMessage };
  }
};

/**
 * Finds matching job listings using Groq AI for the Indian job market.
 * Generates realistic, current job listings based on the candidate's profile.
 * @param jobTitles An array of job titles to search for.
 * @param experienceLevel The candidate's experience level.
 * @returns A promise that resolves to an array of Job objects.
 */
export const findMatchingJobs = async (jobTitles: string[], experienceLevel: string = 'Mid-Level'): Promise<Job[]> => {
  if (!isGroqConfigured) {
    console.error("Groq API key is missing. Skipping job search.");
    return [];
  }
  if (!jobTitles || jobTitles.length === 0) {
    return [];
  }

  try {
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const query = jobTitles.join(', ');

    const prompt = `You are a premier job market analyst for the Indian tech ecosystem. Generate 18 highly realistic, currently active job listings as of ${today} for a candidate with these job titles: ${query}.

Experience Level: ${experienceLevel}

Provide the output as a JSON array ONLY. Each job must include:
[
  {
    "title": "<exact job title>",
    "company": "<specific real-world company>",
    "location": "<Indian city>",
    "match_percentage": <75-99>,
    "apply_url": "<Genuine search URL on LinkedIn, Naukri, or Glassdoor>",
    "description": "<2-3 sentence engaging job description>",
    "salary_range": "<Realistic INR LPA, e.g., '15-25 LPA'>",
    "experience_required": "<e.g., '1-3 years'>",
    "job_type": "<Full-time|Remote|Hybrid>"
  }
]

Rules for Variety and Quality:
1. COMPANY MIX: Include a balanced mix of:
   - BIG TECH/MNCs: Google India, Microsoft, Amazon, Adobe, Atlassian, Oracle.
   - INDIAN UNICORNS: Flipkart, Razorpay, Zomato, Swiggy, Ola, CRED, Pine Labs, Groww, Zerodha.
   - RAPID GROWTH STARTUPS: Zepto, Blinkit, Slice, Jupiter, Postman, BrowserStack, Freshworks, Lenskart, Nykaa.
   - SERVICES/CONSULTING: TCS, Infosys, Wipro, Accenture India, Deloitte India.
2. LOCATION: Use tech hubs like Bangalore, Hyderabad, Pune, Gurgaon, Mumbai, Noida, or 'Remote (India)'.
3. APPLY URLS (Crucial): Construct genuine search links:
   - LinkedIn: https://www.linkedin.com/jobs/search/?keywords=<company>%20<job-title>&location=India
   - Naukri: https://www.naukri.com/<job-title>-jobs-at-<company>?k=<job-title>&l=india
   - Glassdoor: https://www.glassdoor.co.in/Job/jobs.htm?sc.keyword=<company>%20<job-title>
4. DIVERSIFY: Ensure no more than 2 jobs are from the same company.
5. Return ONLY the JSON array, no preamble or markdown.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an elite talent acquisition expert. Respond with raw JSON arrays only.'
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    });

    const jsonString = response.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(jsonString);

    // Handle both { jobs: [...] } and direct [...] formats
    const jobsArray = Array.isArray(parsed) ? parsed : (parsed.jobs || parsed.data || []);

    const matchedJobs: Job[] = jobsArray.slice(0, 18).map((job: any): Job => ({
      title: job.title || 'N/A',
      company: job.company || 'N/A',
      location: job.location || 'India',
      match_percentage: job.match_percentage || Math.floor(70 + Math.random() * 28),
      apply_url: job.apply_url || '#',
      description: job.description || 'No description available.',
      salary_range: job.salary_range || 'Not Disclosed',
      experience_required: job.experience_required || 'Not specified',
      job_type: job.job_type || 'Full-time',
    }));

    return matchedJobs;
  } catch (error) {
    console.error("Error finding matching jobs with Groq:", error);
    return [];
  }
};

/**
 * Generates a personalized cover letter using Groq AI.
 * PRO feature only.
 * @param resumeData The analyzed resume data.
 * @param job The target job listing.
 * @returns The generated cover letter text.
 */
export const generateCoverLetter = async (
  skills: string[],
  experienceLevel: string,
  job: Job
): Promise<{ data: string | null; error: string | null }> => {
  if (!isGroqConfigured) {
    return { data: null, error: "AI features are disabled." };
  }

  try {
    const prompt = `Write a professional, personalized cover letter for the following job application:

Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Job Description: ${job.description}
Job Type: ${job.job_type}

Candidate's Skills: ${skills.join(', ')}
Candidate's Experience Level: ${experienceLevel}

Write a compelling, concise cover letter (250-350 words) that:
1. Opens with enthusiasm for the specific role
2. Highlights relevant skills and experience
3. Shows knowledge of the company
4. Ends with a strong call to action
5. Uses a professional but warm tone

Return ONLY the cover letter text, no JSON formatting.`;

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert cover letter writer. Write compelling, professional cover letters.'
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1024,
    });

    const coverLetter = response.choices[0]?.message?.content?.trim() || '';
    return { data: coverLetter, error: null };
  } catch (error: any) {
    return { data: null, error: error.message || 'Failed to generate cover letter.' };
  }
};
