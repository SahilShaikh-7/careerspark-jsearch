
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Sun, Moon, Menu, X, LayoutDashboard, Upload, Settings, Home, LogIn, LogOut, Loader, CreditCard, Crown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

const AuthModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isSigningUp, setIsSigningUp] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAppContext();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (isSigningUp) {
            const { data, error: signUpError } = await signUpWithEmail(fullName, email, password);
            if (signUpError) {
                setError(signUpError.message);
            } else if (data.user && data.user.identities?.length === 0) {
                 setMessage('An account with this email already exists. Please sign in instead.');
            } else if (data.user && !data.session) {
                 setMessage('✉️ Please check your email and confirm your address before signing in. A confirmation link has been sent.');
                 setTimeout(onClose, 5000);
            } else if (data.user) {
                onClose();
            }
        } else {
            const { error: signInError } = await signInWithEmail(email, password);
            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    setError('Please confirm your email address first. Check your inbox for a confirmation link.');
                } else {
                    setError(signInError.message);
                }
            } else {
                onClose();
            }
        }
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // Google OAuth will redirect, so no need to close modal
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
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-2">{isSigningUp ? 'Create Account' : 'Welcome Back'}</h2>
                    <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{isSigningUp ? 'Join CareerSpark to get started.' : 'Sign in to access your dashboard.'}</p>
                    
                    {/* Google OAuth Button */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mb-4 font-medium"
                    >
                        <GoogleIcon />
                        Continue with Google
                    </button>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {isSigningUp && (
                             <div>
                                <label className="text-sm font-medium">Full Name</label>
                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full mt-1 p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"/>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-medium">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full mt-1 p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"/>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Password</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full mt-1 p-2.5 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"/>
                        </div>
                        
                        {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">{error}</p>}
                        {message && <p className="text-green-600 dark:text-green-400 text-sm text-center bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">{message}</p>}

                        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 flex items-center justify-center transition-all">
                            {loading ? <Loader className="animate-spin" /> : (isSigningUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>
                    
                    {isSigningUp && (
                        <p className="text-xs text-gray-400 text-center mt-3">
                            📧 You'll need to confirm your email address before signing in.
                        </p>
                    )}

                    <p className="text-center text-sm mt-6">
                        {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
                        <button onClick={() => { setIsSigningUp(!isSigningUp); setError(''); setMessage(''); }} className="font-semibold text-purple-500 hover:underline ml-1">
                            {isSigningUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, session, signOut, isAuthModalOpen, openAuthModal, closeAuthModal, isPro, profile } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', text: 'Home', icon: <Home className="h-5 w-5" /> },
    { to: '/upload', text: 'Upload', icon: <Upload className="h-5 w-5" />, auth: true },
    { to: '/dashboard', text: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" />, auth: true },
    { to: '/pricing', text: 'Pricing', icon: <CreditCard className="h-5 w-5" /> },
    { to: '/settings', text: 'Settings', icon: <Settings className="h-5 w-5" />, auth: true },
  ];
  
  const accessibleNavLinks = navLinks.filter(link => !link.auth || session);

  const MobileNav = () => (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-16 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg md:hidden z-40 p-4 border-b border-gray-200 dark:border-gray-800"
      >
        <nav className="flex flex-col space-y-2">
          {accessibleNavLinks.map(link => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md ${isActive ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
              {link.icon}
              <span>{link.text}</span>
            </NavLink>
          ))}
          {session && (
            <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          )}
        </nav>
      </motion.div>
  );
  
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100 transition-colors">
      <header className="sticky top-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-lg z-50 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="url(#grad1)"></path><defs><linearGradient id="grad1" x1="2" y1="2" x2="22" y2="21"><stop offset="0%" stopColor="#8B5CF6"></stop><stop offset="100%" stopColor="#14B8A6"></stop></linearGradient></defs></svg>
              <span className="font-bold text-xl">CareerSpark AI</span>
              {isPro && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full">
                  <Crown className="h-3 w-3" /> PRO
                </span>
              )}
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {accessibleNavLinks.map(link => (
                <NavLink key={link.to} to={link.to} className={({ isActive }) => `px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{link.text}</NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800" aria-label="Toggle theme">
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              {session ? (
                <button onClick={signOut} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <button onClick={openAuthModal} className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 transition-all">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <AnimatePresence>
            {isMenuOpen && <MobileNav />}
        </AnimatePresence>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} CareerSpark AI. All rights reserved.</p>
          <p className="mt-1">Powered by Groq AI • Built with ❤️ in India</p>
        </div>
      </footer>
      
      <AnimatePresence>
        {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
