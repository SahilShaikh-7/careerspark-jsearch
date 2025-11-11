
import React from 'react';
import { isSupabaseConfigured } from '../lib/supabase';
import { isGeminiConfigured, isJsearchConfigured } from '../services/apiService';
import { Server, BrainCircuit, CheckCircle, AlertTriangle, Search } from 'lucide-react';

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
                                    Status: {!isSupabaseConfigured ? 'Not Configured' : 'Configured Successfully'}
                                </p>
                            </div>
                        </div>
                        {!isSupabaseConfigured && (
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-12">
                                <p>Authentication and database features are disabled. Please add your Supabase credentials.</p>
                                <p>1. In your Supabase project, go to <strong>Settings &gt; API</strong>.</p>
                                <p>2. Copy the <strong>Project URL</strong> and <strong>anon public</strong> key.</p>
                                <p>3. Paste them into the following file, replacing the placeholder values:</p>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto">
                                    <code>
                                        // in lib/supabase.ts<br/>
                                        const supabaseUrl = process.env.SUPABASE_URL || "YOUR_PROJECT_URL";<br/>
                                        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "YOUR_ANON_PUBLIC_KEY";
                                    </code>
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Gemini Section */}
                    <div className={`p-4 rounded-lg border ${!isGeminiConfigured ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                         <div className="flex items-center gap-4">
                            {!isGeminiConfigured ? <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" /> : <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />}
                            <div>
                                <h2 className="font-semibold text-lg">Google Gemini API</h2>
                                <p className={`text-sm ${!isGeminiConfigured ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                    Status: {!isGeminiConfigured ? 'Not Configured' : 'Configured Successfully'}
                                </p>
                            </div>
                        </div>
                        {!isGeminiConfigured && (
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-12">
                                <p>AI analysis features are disabled. Please provide your Google Gemini API key.</p>
                                <p>1. Go to Google AI Studio and create an API key.</p>
                                <p>2. The key is automatically injected via the <code>process.env.API_KEY</code> variable in AI Studio.</p>
                                <p>3. If running locally, ensure the <code>API_KEY</code> environment variable is set.</p>
                            </div>
                        )}
                    </div>
                    
                    {/* JSearch Section */}
                    <div className={`p-4 rounded-lg border ${!isJsearchConfigured ? 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'}`}>
                         <div className="flex items-center gap-4">
                            {!isJsearchConfigured ? <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0" /> : <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />}
                            <div>
                                <h2 className="font-semibold text-lg">JSearch Job API</h2>
                                <p className={`text-sm ${!isJsearchConfigured ? 'text-red-700 dark:text-red-300' : 'text-green-700 dark:text-green-300'}`}>
                                    Status: {!isJsearchConfigured ? 'Not Configured' : 'Configured Successfully'}
                                </p>
                            </div>
                        </div>
                        {!isJsearchConfigured && (
                            <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 space-y-2 pl-12">
                                <p>Job matching is disabled. Please provide your JSearch API key from RapidAPI.</p>
                                <p>1. Go to RapidAPI and subscribe to the JSearch API.</p>
                                <p>2. Copy your <strong>X-RapidAPI-Key</strong>.</p>
                                <p>3. Paste the key (e.g., the one starting with `abdab7...`) into the following file, replacing the placeholder value:</p>
                                <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-md text-xs overflow-x-auto">
                                    <code>
                                        // in services/apiService.ts<br/>
                                        const JSEARCH_API_KEY = process.env.JSEARCH_API_KEY || "YOUR_JSEARCH_API_KEY_HERE";
                                    </code>
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        After updating your configuration, please <strong>refresh this page</strong> to apply the changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const ConfigurationGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (!isSupabaseConfigured || !isGeminiConfigured || !isJsearchConfigured) {
        return <SetupGuide />;
    }
    return <>{children}</>;
};
