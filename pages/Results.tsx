import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader, AlertTriangle, Download, ArrowLeft, Star, Briefcase, Lightbulb, TrendingUp, PieChart, GitCommit, Crown, FileText, ExternalLink, Lock, X } from 'lucide-react';
import { getResumeData } from '../services/supabaseService';
import { generateCoverLetter } from '../services/apiService';
import { Resume, Job } from '../types';
import { generateTxtReport } from '../utils/helpers';
import { useAppContext } from '../context/AppContext';
import SkillMeter from '../components/SkillMeter';
import SkillsDistributionPieChart from '../components/SkillsPieChart';
import AssessmentRadarChart from '../components/AssessmentRadarChart';

const ScoreCircle: React.FC<{ score: number, color: string }> = ({ score, color }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    
    return (
        <svg width="160" height="160" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                className="stroke-gray-200 dark:stroke-gray-700"
                fill="transparent"
            />
            <motion.circle
                cx="60"
                cy="60"
                r={radius}
                strokeWidth="10"
                stroke={color}
                fill="transparent"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                strokeLinecap="round"
            />
            <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="transform rotate-90 origin-center font-bold" style={{ fontSize: '24px', fill: color }}>
                {score}%
            </text>
        </svg>
    );
};

const CoverLetterModal: React.FC<{ 
    job: Job; 
    skills: string[]; 
    experienceLevel: string;
    onClose: () => void 
}> = ({ job, skills, experienceLevel, onClose }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [isGenerating, setIsGenerating] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generate = async () => {
            const { data, error } = await generateCoverLetter(skills, experienceLevel, job);
            if (error) {
                setError(error);
            } else {
                setCoverLetter(data || '');
            }
            setIsGenerating(false);
        };
        generate();
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="h-5 w-5 text-purple-500" /> AI Cover Letter
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">For {job.title} at {job.company}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader className="h-8 w-8 animate-spin text-purple-500" />
                            <p className="mt-4 text-gray-500">Generating your cover letter...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                            {coverLetter}
                        </div>
                    )}
                </div>
                {!isGenerating && !error && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                        <button onClick={handleCopy} className="flex-1 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                            Copy to Clipboard
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const Results: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [resume, setResume] = useState<Resume | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
    const { isPro } = useAppContext();

    useEffect(() => {
        if (!id) {
            setError('No resume ID provided.');
            setIsLoading(false);
            return;
        }

        const fetchResume = async () => {
            try {
                const data = await getResumeData(id);
                if (!data) throw new Error('Resume not found or you do not have permission to view it.');
                setResume(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch resume data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResume();
    }, [id]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader className="animate-spin h-10 w-10 text-purple-500" /></div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">An Error Occurred</h2>
                <p className="text-red-500 mt-2">{error}</p>
                <Link to="/dashboard" className="mt-6 inline-block px-6 py-2 bg-purple-600 text-white rounded-lg">Go to Dashboard</Link>
            </div>
        );
    }
    
    if (!resume) {
        return <div className="text-center py-10"><h2>No resume data available.</h2></div>;
    }

    const scoreColor = resume.score > 95 ? '#10B981' : resume.score > 60 ? '#F59E0B' : '#EF4444';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <Link to="/dashboard" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">Analysis for: <span className="text-purple-500">{resume.filename}</span></h1>
                    <p className="text-gray-500 dark:text-gray-400">Analyzed on {new Date(resume.created_at).toLocaleDateString()}</p>
                </div>
                <button onClick={() => generateTxtReport(resume)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <Download className="h-5 w-5" /> Download Report
                </button>
            </div>
            
            <div className="space-y-8">
                {/* Top Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Star className="text-yellow-400" /> Overall Score</h2>
                            <div className="flex justify-center items-center my-4">
                                <ScoreCircle score={resume.score} color={scoreColor} />
                            </div>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Based on skills, experience, and clarity.</p>
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold flex items-center gap-2"><Lightbulb className="text-blue-400" /> Actionable Feedback</h2>
                            <ul className="mt-4 space-y-3 list-disc list-inside text-gray-600 dark:text-gray-300">
                                {resume.feedback.map((fb, index) => <li key={index}>{fb.suggestion}</li>)}
                            </ul>
                        </div>
                    </div>
                     <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><TrendingUp className="text-indigo-400" /> Top Skills Analysis</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">AI confidence in your most prominent skills.</p>
                            <SkillMeter skills={resume.skills} />
                        </div>
                        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold flex items-center gap-2"><Briefcase className="text-green-400" /> Job Matches ({resume.matched_jobs.length})</h2>
                                {!isPro && (
                                    <Link to="/pricing" className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full font-medium">
                                        <Crown className="h-3 w-3" /> Upgrade for Apply & Cover Letter
                                    </Link>
                                )}
                            </div>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                               {resume.matched_jobs.length > 0 ? resume.matched_jobs.map((job: Job, index) => (
                                    <div key={job.id || index} className="p-4 border dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                        <div className="flex justify-between items-start gap-3">
                                            <div className="flex-1">
                                                <h3 className="font-bold text-purple-600 dark:text-purple-400">{job.title}</h3>
                                                <p className="text-sm font-medium">{job.company}</p>
                                                <p className="text-sm text-gray-500">{job.location} • {job.job_type}</p>
                                                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                                    <span>💰 {job.salary_range}</span>
                                                    <span>📅 {job.experience_required}</span>
                                                    <span className="text-green-600 font-medium">{job.match_percentage}% match</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {isPro ? (
                                                    <>
                                                        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all">
                                                            <ExternalLink className="h-3 w-3" /> Apply
                                                        </a>
                                                        <button
                                                            onClick={() => setCoverLetterJob(job)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
                                                        >
                                                            <FileText className="h-3 w-3" /> Cover Letter
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-lg cursor-not-allowed">
                                                        <Lock className="h-3 w-3" /> Pro Only
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No matching jobs found at the moment.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Assessment Section */}
                <div className="bg-white dark:bg-dark-card p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-bold mb-6 text-center">Comprehensive Assessment</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2"><PieChart className="text-purple-400"/>Skills Distribution</h3>
                            <div className="h-80">
                                <SkillsDistributionPieChart skills={resume.skills} />
                            </div>
                        </div>
                        <div>
                           <h3 className="text-lg font-semibold text-center mb-2 flex items-center justify-center gap-2"><GitCommit className="text-teal-400"/>Strength Analysis</h3>
                            <div className="h-80">
                                <AssessmentRadarChart resume={resume} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cover Letter Modal */}
            <AnimatePresence>
                {coverLetterJob && resume && (
                    <CoverLetterModal
                        job={coverLetterJob}
                        skills={resume.skills.map(s => s.name)}
                        experienceLevel={resume.experience_level}
                        onClose={() => setCoverLetterJob(null)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Results;
