import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BrainCircuit, Search, BarChart, Zap, Shield, Crown } from 'lucide-react';
import ParticleCanvas from '../components/ParticleCanvas';
import { useAppContext } from '../context/AppContext';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const { session, openAuthModal, isPro } = useAppContext();

    const stats = [
        { value: '10,000+', label: 'Resumes Analyzed' },
        { value: '95%', label: 'Success Rate' },
        { value: '500+', label: 'Daily Job Matches' },
        { value: '24/7', label: 'AI Support' },
    ];

    const features = [
        { icon: <BrainCircuit className="h-8 w-8 text-purple-400" />, title: 'AI Analysis', description: 'Powered by Groq AI with Llama 3.3 — extract skills, score your resume, and get actionable feedback in seconds.' },
        { icon: <Search className="h-8 w-8 text-blue-400" />, title: 'Indian Job Market', description: 'AI-curated job matches from top Indian companies — TCS, Infosys, Flipkart, Razorpay, and more.' },
        { icon: <BarChart className="h-8 w-8 text-teal-400" />, title: 'Interactive Visuals', description: 'Understand your strengths with beautiful charts, skill meters, and comprehensive assessments.' },
    ];

    const plans = [
        {
            name: 'Standard',
            price: 'Free',
            features: ['Basic resume analysis', 'Skill extraction', 'Job suggestions (view only)', 'Download report'],
            cta: 'Get Started Free',
            highlighted: false,
        },
        {
            name: 'Pro',
            price: '₹99',
            period: '/year',
            features: ['Advanced AI analysis', 'Apply directly to jobs', 'AI Cover Letter Generator', 'Priority support', 'Unlimited analyses'],
            cta: 'Upgrade to Pro',
            highlighted: true,
        },
    ];

    const handleAction = (path: string) => {
        if (session) {
            navigate(path);
        } else {
            openAuthModal();
        }
    };

    return (
        <div className="relative overflow-hidden">
            <ParticleCanvas />
            <div className="relative z-10 text-center py-20 md:py-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-6"
                >
                    <Zap className="h-4 w-4" /> Now powered by Groq AI — Lightning fast analysis
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight"
                >
                    <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-teal-400 bg-clip-text text-transparent">CareerSpark AI</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300"
                >
                    Transform Your Career with AI-Powered Resume Analysis & Indian Job Matching.
                </motion.p>
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
                >
                    <button onClick={() => handleAction('/upload')} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-blue-600 transition-all hover:scale-105">
                        Analyze My Resume
                    </button>
                    <button onClick={() => navigate('/pricing')} className="px-8 py-3 bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-300 font-semibold rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105 border border-gray-200 dark:border-gray-700">
                        View Pricing
                    </button>
                </motion.div>
            </div>
            
            <div className="relative z-10 container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 my-16 text-center">
                {stats.map((stat, index) => (
                    <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">{stat.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 container mx-auto my-24">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            className="bg-white/50 dark:bg-dark-card backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow"
                        >
                            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-purple-100 to-teal-100 dark:from-purple-900/50 dark:to-teal-900/50 mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Quick Pricing Preview */}
            <div className="relative z-10 container mx-auto my-24">
                <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
                <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Start free, upgrade when you need more.</p>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            viewport={{ once: true }}
                            className={`p-8 rounded-2xl border ${plan.highlighted ? 'border-purple-500 bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-900 shadow-xl ring-2 ring-purple-500/20' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-card shadow-lg'}`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                {plan.highlighted && <Crown className="h-5 w-5 text-amber-500" />}
                            </div>
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold">{plan.price}</span>
                                {plan.period && <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>}
                            </div>
                            <ul className="space-y-3 mb-8">
                                {plan.features.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Shield className="h-4 w-4 text-green-500 flex-shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => plan.highlighted ? navigate('/pricing') : handleAction('/upload')}
                                className={`w-full py-3 rounded-lg font-semibold transition-all ${plan.highlighted ? 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                            >
                                {plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="relative z-10 container mx-auto my-24">
                 <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 p-12 rounded-2xl text-white text-center shadow-2xl"
                >
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Hired?</h2>
                    <p className="text-lg mb-8 max-w-2xl mx-auto">Let our AI be your personal career coach. Get started now and take the next step in your professional journey.</p>
                    <button onClick={() => handleAction('/upload')} className="px-10 py-4 bg-white text-purple-600 font-bold rounded-lg shadow-lg hover:bg-gray-100 transition-transform hover:scale-105 flex items-center gap-2 mx-auto">
                        Get Started Free <ArrowRight className="h-5 w-5" />
                    </button>
                 </motion.div>
            </div>
        </div>
    );
};

export default Home;