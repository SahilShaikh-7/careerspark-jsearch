import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, ShieldAlert, Crown, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Settings: React.FC = () => {
    const { user, profile, updateProfile, isPro, isAdmin, signOut } = useAppContext();
    const [fullName, setFullName] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    
    const email = user?.email || '';

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name);
        }
    }, [profile]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile({ full_name: fullName });
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    if (!user) {
         return (
            <div className="text-center py-20 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                <ShieldAlert className="h-12 w-12 mx-auto text-purple-500"/>
                <h3 className="text-2xl font-bold mt-4">Access Denied</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Please sign in to access your settings.</p>
            </div>
        )
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
        >
            <h1 className="text-4xl font-bold text-center">Settings</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 text-center mt-2">
                Manage your account and subscription.
            </p>

            {/* Subscription Status */}
            <div className={`mt-8 p-6 rounded-2xl border ${isPro ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-800'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown className={`h-6 w-6 ${isPro ? 'text-amber-500' : 'text-gray-400'}`} />
                        <div>
                            <h3 className="font-bold text-lg">{isPro ? 'Pro Plan' : 'Standard Plan (Free)'}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {isAdmin ? 'System Administrator — Lifetime Pro' : isPro 
                                    ? `Expires: ${profile?.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'Never'}`
                                    : 'Upgrade to unlock all premium features'}
                            </p>
                        </div>
                    </div>
                    {isPro ? (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold rounded-full">Active</span>
                    ) : (
                        <a href="/pricing" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all">
                            Upgrade to Pro
                        </a>
                    )}
                </div>
            </div>

            {/* Profile Form */}
            <form 
                onSubmit={handleSave}
                className="mt-6 bg-white dark:bg-dark-card p-8 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 space-y-6"
            >
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email Address
                    </label>
                     <input
                        type="email"
                        id="email"
                        value={email}
                        disabled
                        className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400"
                    />
                </div>
                <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g., Jane Doe"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <button
                        type="submit"
                        className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white ${isSaved ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all`}
                    >
                        {isSaved ? <Check className="h-5 w-5 mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        {isSaved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Sign Out Button */}
            <div className="mt-6">
                <button
                    onClick={signOut}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </motion.div>
    );
};

export default Settings;