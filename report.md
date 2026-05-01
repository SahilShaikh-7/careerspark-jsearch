# CareerSpark AI - Project Report

## 1. Project Information
**Project Name:** CareerSpark AI
**Description:** CareerSpark AI is an intelligent web application designed to help users analyze their resumes and find the most relevant job opportunities. By combining the power of generative AI for resume parsing and a dedicated job search API, the platform provides actionable feedback, skill analysis, and tailored job matches.
**Tech Stack:**
- **Frontend:** React 19, TypeScript, Vite
- **Routing:** React Router DOM (HashRouter)
- **UI & Animations:** Framer Motion (animations), Recharts (data visualization), Three.js / React Three Fiber (3D elements), Lucide React (icons)
- **Backend/Database:** Supabase (PostgreSQL, Storage, Auth)
- **External APIs:** Google Gemini API (Resume Parsing & Analysis), JSearch via RapidAPI (Job Searching)

---

## 2. The Working (Workflow)
The application follows a seamless workflow to process user resumes and fetch relevant jobs:

1. **Upload Phase:** The user uploads their resume (PDF/DOCX) using a drag-and-drop interface powered by `react-dropzone`. The file is converted to Base64 format.
2. **AI Analysis (Gemini API):** The Base64 string of the resume is sent to the Google Gemini API (`gemini-2.5-flash`). The AI model is prompted to act as an expert recruiter. It extracts structured JSON data containing:
   - An overall score (out of 100).
   - Experience level and total years of experience.
   - Actionable feedback for improvement.
   - A list of categorized skills with confidence scores.
   - Suggested suitable job titles based on the resume.
3. **Job Matching (JSearch API):** The extracted job titles are passed to the `JSearch API` (via RapidAPI). The API searches for real-world, active job listings matching these titles and returns data such as company name, location, salary range, and application links.
4. **Data Persistence (Supabase):** The uploaded resume is stored in Supabase Storage. The parsed data, skills, feedback, and matched jobs are saved to their respective relational tables in the Supabase PostgreSQL database.
5. **Dashboard & Results:** The user is redirected to a results page where they can view a comprehensive breakdown of their resume score, skills charts (via Recharts), actionable feedback, and a list of job cards they can apply to directly.

---

## 3. System Architecture
The application is built on a modern serverless/BaaS architecture:

### Frontend Layer (Client)
- **UI Components:** Reusable React components structured in the `components/` directory. Pages like Home, Upload, Dashboard, Results, and Settings are handled by React Router.
- **State Management:** React Context API (`AppContext`) is used for global state.
- **Configuration Guard:** Ensures required API keys are present before letting users access core functionality.

### Service Layer (Logic & Integration)
- **`apiService.ts`:** Acts as the bridge between the frontend and external AI/Search providers.
  - Manages the `GoogleGenAI` client for resume analysis.
  - Handles `fetch` requests to the JSearch RapidAPI endpoint.
- **`supabaseService.ts`:** Manages all interactions with the Supabase backend.
  - Handles CRUD operations for `profiles`, `resumes`, `skills`, `feedback`, and `matched_jobs` tables.
  - Handles file uploads to Supabase Storage buckets.

### Data Layer (Supabase)
- **Storage:** Stores raw resume files.
- **Database (PostgreSQL Tables):**
  - `profiles`: User information.
  - `resumes`: Metadata about uploaded resumes (score, experience).
  - `skills`: Extracted skills mapped to resumes.
  - `feedback`: Suggestions mapped to resumes.
  - `matched_jobs`: Fetched jobs mapped to resumes.

---

## 4. Pros and Cons of the Project

### Pros
- **Intelligent Parsing:** Using Gemini 2.5 Flash provides highly accurate and context-aware resume parsing compared to traditional regex-based parsers.
- **Real-Time Job Data:** Integrating JSearch ensures users get up-to-date and real-world job listings, making the app highly practical.
- **Modern UI/UX:** The inclusion of Framer Motion and Three.js creates a visually stunning and engaging user experience.
- **Scalable Backend:** Leveraging Supabase abstracts away complex backend setups, providing secure storage and an easily queryable relational database.
- **Cost-Effective:** Utilizing Gemini 2.5 Flash is both fast and economical for AI tasks.

### Cons
- **Dependency on External APIs:** The core functionality relies entirely on Google Gemini and RapidAPI (JSearch). If either service goes down or API keys expire/exceed quota, the app breaks.
- **AI Hallucinations / Format Instability:** While a JSON schema is enforced, LLMs can occasionally return malformed JSON or hallucinate skills not present in the resume.
- **JSearch Rate Limits:** Free tiers on RapidAPI are highly restrictive. Concurrent users might exhaust the API quota quickly.
- **Hash Routing:** The use of `<HashRouter>` is sub-optimal for SEO and creates less aesthetic URLs (`/#/dashboard`) compared to `<BrowserRouter>`.

---

## 5. Areas for Improvement & Future Enhancements

### Functionality that can be improved immediately:
1. **API Caching Strategy:** 
   - *Improvement:* Cache JSearch API responses in Supabase or local storage. If two users have similar job title suggestions, fetch from the database instead of hitting the JSearch API to save quota.
2. **Error Handling & Fallbacks:** 
   - *Improvement:* Add retry mechanisms for Gemini API calls. If Gemini fails, fallback to a simpler local keyword extraction logic so the user isn't blocked completely.
3. **Routing:** 
   - *Improvement:* Switch from `HashRouter` to `BrowserRouter` and configure the hosting provider (e.g., Vercel/Netlify) to handle client-side routing properly.

### How to make this project even better (New Features):
1. **AI Cover Letter Generator:** Add a feature where users can click "Generate Cover Letter" on a specific matched job. Send the job description and the user's resume data to Gemini to draft a highly personalized cover letter.
2. **Interactive Resume Builder:** Instead of just analyzing existing resumes, allow users to edit the extracted data and export a beautifully formatted new PDF resume directly from the app.
3. **Application Tracking System (ATS):** Allow users to change the status of matched jobs (e.g., "Saved", "Applied", "Interviewing", "Rejected") to manage their entire job hunt process within the dashboard.
4. **Skill Gap Analysis:** Compare the user's skills against the requirements of their desired job titles and recommend specific online courses or certifications to bridge the gap.
5. **Mock Interviews:** Use the Gemini API to generate tailored interview questions based on the user's resume and the matched job descriptions, offering a text-based or voice-based mock interview interface.
