import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { FileUp, Loader, AlertTriangle, CheckCircle, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { analyzeResume, findMatchingJobs, isGroqConfigured } from '../services/apiService';
import { saveResumeData, uploadResumeFile } from '../services/supabaseService';

const Upload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({ stage: '', percentage: 0 });
    const [error, setError] = useState<string | null>(null);
    const { user, openAuthModal, isPro } = useAppContext();
    const navigate = useNavigate();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setError(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        multiple: false,
        disabled: !isGroqConfigured,
    });

    const baseStyle = 'border-2 border-dashed rounded-2xl p-12 text-center transition-colors duration-300';
    const activeStyle = 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
    const disabledStyle = 'bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-60';
    
    const style = useMemo(() => `${baseStyle} ${isDragActive ? activeStyle : 'border-gray-300 dark:border-gray-700'} ${!isGroqConfigured ? disabledStyle : 'cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'}`, [isDragActive, isGroqConfigured]);

    const handleAnalysis = async () => {
        if (!isGroqConfigured) {
            setError("AI features are disabled. Please configure your Groq API key.");
            return;
        }
        if (!user) {
            openAuthModal();
            return;
        }
        if (!file) {
            setError("Please select a file to analyze.");
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            setProgress({ stage: 'Uploading file securely...', percentage: 10 });
            const fileUrl = await uploadResumeFile(file, user.id);
            if (!fileUrl) throw new Error("Failed to upload your resume file.");

            setProgress({ stage: 'AI is analyzing your resume...', percentage: 25 });
            const { data: analysis, error: analysisError } = await analyzeResume(file);
            if (analysisError || !analysis) throw new Error(analysisError || "Failed to analyze resume.");

            setProgress({ stage: 'Finding job matches in India...', percentage: 60 });
            const matchedJobs = await findMatchingJobs(analysis.job_titles, analysis.experience_level);
            
            setProgress({ stage: 'Saving results...', percentage: 90 });
            const resumePayload = {
                user_id: user.id,
                filename: file.name,
                file_url: fileUrl,
                score: analysis.score,
                experience_level: analysis.experience_level,
                total_experience: analysis.total_experience,
                feedback: analysis.feedback.map((s: string) => ({ suggestion: s })),
                skills: analysis.skills,
                matched_jobs: matchedJobs,
            };

            const { data: savedResume, error: saveError } = await saveResumeData(resumePayload);
            if (saveError || !savedResume) throw new Error(saveError?.message || "Failed to save results.");

            setProgress({ stage: 'Complete!', percentage: 100 });
            setTimeout(() => navigate(`/results/${savedResume.id}`), 1000);

        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
            setProgress({ stage: '', percentage: 0 });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-center">Upload Your Resume</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mt-2">
                Let our AI analyze your resume and find the best job opportunities for you.
            </p>

            {!isPro && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-3"
                >
                    <Crown className="h-5 w-5 text-amber-500 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="font-medium text-amber-800 dark:text-amber-200">Standard Plan — Basic analysis only</p>
                        <p className="text-amber-600 dark:text-amber-400">Upgrade to Pro for cover letter generation, direct job apply, and more.</p>
                    </div>
                </motion.div>
            )}
            
            {!isGroqConfigured && (
                <div className="mt-8 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 rounded-lg flex items-center gap-4">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-200">AI Features Disabled</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">
                            The Groq API key is not configured. Please set <code>VITE_GROQ_API_KEY</code> in your .env file.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-8">
                {!isLoading && (
                    <div {...getRootProps({ className: style })}>
                        <input {...getInputProps()} />
                        <FileUp className="h-12 w-12 mx-auto text-gray-400" />
                        {isDragActive ? (
                            <p className="mt-4 text-purple-600 font-medium">Drop the file here ...</p>
                        ) : (
                            <p className="mt-4 text-gray-500">
                                {!isGroqConfigured 
                                    ? 'AI analysis is disabled. Please configure the API key.' 
                                    : "Drag 'n' drop a PDF or DOCX file here, or click to select a file."
                                }
                            </p>
                        )}
                    </div>
                )}
                
                <AnimatePresence>
                    {file && !isLoading && (
                         <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                            className="text-center mt-4"
                        >
                            <p className="font-semibold">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            <button 
                                onClick={handleAnalysis} 
                                disabled={!isGroqConfigured}
                                className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
                                Start Analysis
                            </button>
                         </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <div className="mt-8 text-center">
                        <Loader className="h-10 w-10 mx-auto animate-spin text-purple-500" />
                        <p className="mt-4 font-semibold text-lg">{progress.stage}</p>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                            <div className="bg-gradient-to-r from-purple-600 to-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress.percentage}%` }}></div>
                        </div>
                        {progress.percentage === 100 && <CheckCircle className="h-10 w-10 mx-auto text-green-500 mt-4" />}
                    </div>
                )}

                {error && (
                    <div className="mt-6 flex items-center justify-center gap-2 text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                        <AlertTriangle className="h-5 w-5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Upload;