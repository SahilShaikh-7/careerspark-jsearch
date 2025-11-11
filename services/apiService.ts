// JSearch API Configuration
// Replace the placeholder with your actual JSearch API key from RapidAPI or use environment variables for better security.
const JSEARCH_API_KEY_PLACEHOLDER = "YOUR_JSEARCH_API_KEY_HERE";
export const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "abdab7afefmsh7a689eed899d741p153425jsne4e416b97f36";

// This flag returns true only if a valid API key is provided instead of the placeholder.
export const isJsearchConfigured = JSEARCH_API_KEY !== JSEARCH_API_KEY_PLACEHOLDER && JSEARCH_API_KEY.length > 0;


/**
 * Finds matching job listings using the JSearch API.
 * @param jobTitles An array of job titles to search for.
 * @returns A promise that resolves to an array of Job objects.
 */
export const findMatchingJobs = async (jobTitles: string[]): Promise<Job[]> => {
    if (!isJsearchConfigured) {
        console.error("JSearch API key is missing or not configured properly. Skipping job search.");
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
            match_percentage: Math.floor(70 + Math.random() * 30), // Placeholder match percentage
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
