
import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { isGroqConfigured } from '../services/apiService';
import { Server, BrainCircuit, CheckCircle, AlertTriangle } from 'lucide-react';

const SetupGuide: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-gray-100 dark:bg-dark-bg z-[100] flex items-center justify-center p-4 text-gray-900 dark:text-gray-100">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900/50 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800">
                <h1 className="text-3xl font-bold text-center mb-2">Configuration Required</h1>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
                    To use CareerSpark AI, you need to connect your backend and AI services.
                </p>

                <div className="space-y-6">
                    {/* Supabase Section */}
                    <div className={`p-4 rounded-lg border ${!isSupabaseConfigured ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                        <div className="flex items-center gap-4">
                            {!isSupabaseConfigured ? <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" /> : <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />}
                            <div>
                                <h2 className="font-semibold text-lg">Supabase Backend</h2>
                                <p className={`text-sm ${!isSupabaseConfigured ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                    Status: {!isSupabaseConfigured ? 'Not Configured' : 'Connected'}
                                </p>
                            </div>
                        </div>
                        {!isSupabaseConfigured && (
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-12">
                                <p>Set <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> file.</p>
                            </div>
                        )}
                    </div>

                    {/* Groq Section */}
                    <div className={`p-4 rounded-lg border ${!isGroqConfigured ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                         <div className="flex items-center gap-4">
                            {!isGroqConfigured ? <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" /> : <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />}
                            <div>
                                <h2 className="font-semibold text-lg">Groq AI Engine</h2>
                                <p className={`text-sm ${!isGroqConfigured ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                    Status: {!isGroqConfigured ? 'Not Configured' : 'Connected'}
                                </p>
                            </div>
                        </div>
                        {!isGroqConfigured && (
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-12">
                                <p>Set <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">VITE_GROQ_API_KEY</code> in your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> file.</p>
                                <p>Get a free API key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-purple-500 underline">console.groq.com</a></p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        After updating your <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> file, <strong>restart the dev server</strong> to apply changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ConfigurationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isSupabaseConfigured || !isGroqConfigured) {
        return <SetupGuide />;
    }
    return <>{children}</>;
};
