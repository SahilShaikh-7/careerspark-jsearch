import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Zap, Shield, FileText, Briefcase, ExternalLink, Loader, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { upgradeSubscription } from '../services/supabaseService';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

const Pricing: React.FC = () => {
    const { user, isPro, openAuthModal, refreshProfile, profile } = useAppContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handleUpgrade = async () => {
        if (!user) {
            openAuthModal();
            return;
        }

        if (isPro) return;

        setIsProcessing(true);

        try {
            // Load Razorpay script dynamically
            if (!window.Razorpay) {
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.async = true;
                document.body.appendChild(script);
                await new Promise((resolve) => {
                    script.onload = resolve;
                });
            }

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const orderResponse = await fetch(`${apiUrl}/api/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 9900, currency: 'INR', receipt: `receipt_${user.id}` })
            });

            if (!orderResponse.ok) {
                throw new Error('Failed to create order');
            }

            const order = await orderResponse.json();

            const options = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount, 
                currency: order.currency,
                name: 'CareerSpark AI',
                description: 'Pro Plan - 1 Year Subscription',
                image: 'https://api.dicebear.com/7.x/shapes/svg?seed=careerspark',
                order_id: order.id,
                handler: async function (response: any) {
                    // Payment successful - update subscription
                    const success = await upgradeSubscription(user.id, response.razorpay_payment_id);
                    if (success) {
                        setPaymentSuccess(true);
                        await refreshProfile();
                    }
                    setIsProcessing(false);
                },
                prefill: {
                    name: profile?.full_name || '',
                    email: user.email || '',
                },
                notes: {
                    user_id: user.id,
                    plan: 'pro_annual',
                },
                theme: {
                    color: '#7C3AED',
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            setIsProcessing(false);
        }
    };

    const standardFeatures = [
        'Basic resume analysis',
        'Skill extraction & scoring',
        'Job suggestions (view only)',
        'Download text report',
        'Skill distribution charts',
        'Strength analysis radar',
    ];

    const proFeatures = [
        'Everything in Standard',
        'Apply directly to jobs',
        'AI Cover Letter Generator',
        'Advanced AI insights',
        'Priority analysis queue',
        'Unlimited analyses',
        'Premium support',
    ];

    if (paymentSuccess) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-lg mx-auto text-center py-20"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                >
                    <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
                </motion.div>
                <h1 className="text-3xl font-bold mt-6">Welcome to Pro! 🎉</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg">
                    Your account has been upgraded. You now have access to all premium features.
                </p>
                <a href="/upload" className="inline-block mt-8 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all">
                    Start Analyzing →
                </a>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold">
                    <span className="bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">Simple Pricing</span>
                </h1>
                <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Start free and upgrade when you need premium features. No hidden charges.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Standard Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-dark-card p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-6 w-6 text-gray-400" />
                        <h2 className="text-2xl font-bold">Standard</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Perfect for getting started</p>
                    
                    <div className="mb-8">
                        <span className="text-5xl font-extrabold">Free</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">forever</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {standardFeatures.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm">
                                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => user ? window.location.href = '/upload' : openAuthModal()}
                        className="w-full py-3 bg-gray-100 dark:bg-gray-800 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        {user ? 'Go to Upload' : 'Get Started Free'}
                    </button>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative bg-white dark:bg-dark-card p-8 rounded-2xl shadow-xl border-2 border-purple-500 ring-4 ring-purple-500/10"
                >
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                            <Zap className="h-3 w-3" /> MOST POPULAR
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2 mt-2">
                        <Crown className="h-6 w-6 text-amber-500" />
                        <h2 className="text-2xl font-bold">Pro</h2>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">For serious job seekers</p>
                    
                    <div className="mb-8">
                        <span className="text-5xl font-extrabold">₹99</span>
                        <span className="text-gray-500 dark:text-gray-400 ml-2">/year</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {proFeatures.map((feature, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm">
                                <Check className="h-5 w-5 text-purple-500 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300 font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={handleUpgrade}
                        disabled={isProcessing || isPro}
                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isPro 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-default'
                                : 'bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600 hover:shadow-lg'
                        }`}
                    >
                        {isProcessing ? (
                            <><Loader className="h-5 w-5 animate-spin" /> Processing...</>
                        ) : isPro ? (
                            <><CheckCircle className="h-5 w-5" /> You're on Pro</>
                        ) : (
                            <><Crown className="h-5 w-5" /> Upgrade Now — ₹99/year</>
                        )}
                    </button>
                </motion.div>
            </div>

            {/* FAQ Section */}
            <div className="mt-20 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
                <div className="space-y-6">
                    {[
                        { q: 'Is the Standard plan really free?', a: 'Yes! You can analyze your resume, view skills, and get job suggestions completely free. No credit card required.' },
                        { q: 'What payment methods do you accept?', a: 'We use Razorpay for secure payments. You can pay via UPI, debit card, credit card, net banking, and more.' },
                        { q: 'Can I cancel my Pro subscription?', a: 'Pro is a one-time annual payment of ₹99. There are no auto-renewals. You can choose to renew when it expires.' },
                        { q: 'What does "Apply directly" mean?', a: 'Pro users can click the Apply button on matched jobs to go directly to the company\'s career page and apply.' },
                    ].map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-gray-800"
                        >
                            <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default Pricing;
