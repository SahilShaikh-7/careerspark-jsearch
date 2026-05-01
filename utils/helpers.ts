
import { Resume } from '../types';

import * as pdfjsLib from 'pdfjs-dist';

// Configure the worker for pdfjs-dist using a CDN to avoid Vite build issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  try {
    if (file.type === 'application/pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' \n';
      }
      return fullText;
    } else {
      // For basic txt files or other fallback (like docx if not parsed perfectly)
      return await file.text();
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    // Fallback to basic text reading
    return await file.text();
  }
};


export const generateTxtReport = (resume: Resume) => {
    let report = `CAREERSPARK AI - RESUME ANALYSIS REPORT\n`;
    report += `========================================\n\n`;
    report += `Filename: ${resume.filename}\n`;
    // FIX: Changed resume.createdAt to resume.created_at to match the type definition.
    report += `Analyzed On: ${new Date(resume.created_at).toLocaleString()}\n\n`;
    report += `--- OVERALL SCORE: ${resume.score}/100 ---\n\n`;
    
    report += `--- EXPERIENCE ---\n`;
    report += `Level: ${resume.experience_level}\n`;
    report += `Total Years: ${resume.total_experience}\n\n`;

    report += `--- SKILLS (${resume.skills.length}) ---\n`;
    resume.skills.forEach(skill => {
        report += `- ${skill.name} (Category: ${skill.category}, Confidence: ${Math.round(skill.confidence * 100)}%)\n`;
    });
    report += `\n`;

    report += `--- ACTIONABLE FEEDBACK ---\n`;
    resume.feedback.forEach((fb, index) => {
        report += `${index + 1}. ${fb.suggestion}\n`;
    });
    report += `\n`;

    report += `--- MATCHED JOBS (${resume.matched_jobs.length}) ---\n`;
    resume.matched_jobs.forEach(job => {
        report += `----------------------------------------\n`;
        report += `Title: ${job.title}\n`;
        report += `Company: ${job.company}\n`;
        report += `Location: ${job.location}\n`;
        report += `Match: ${job.match_percentage}%\n`;
        report += `Salary: ${job.salary_range}\n`;
        report += `Experience: ${job.experience_required}\n`;
        report += `Type: ${job.job_type}\n`;
        report += `Apply: ${job.apply_url}\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CareerSpark_Report_${resume.filename.split('.')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
};