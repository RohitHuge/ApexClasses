import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );
}

export default function Login() {
    const { login, loginWithLogto, user, isGuest } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    const searchParams = new URLSearchParams(window.location.search);
    const redirectUrl = searchParams.get('redirect');

    const isAuthed = user && !isGuest;
    React.useEffect(() => {
        if (isAuthed) navigate(redirectUrl || '/dashboard');
    }, [isAuthed, navigate, redirectUrl]);

    if (isAuthed) return null;

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
            navigate(redirectUrl || (u.role === 'admin' ? '/admin/nexus-terminal' : '/dashboard'));
        } catch (err) {
            if (err.code === 'PASSWORD_NOT_SET') {
                toast.error('Please set your password first.', { duration: 6000 });
                navigate(`/forgot-password?email=${encodeURIComponent(email)}`);
            } else {
                toast.error(err.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
                        <p className="text-gray-500 mt-2 font-medium">Sign in to your Apex Classes account</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100 space-y-4">
                        {/* Google — direct_sign_in to skip Logto's own UI */}
                        <button
                            onClick={() => loginWithLogto('google')}
                            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-100" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-4 text-sm text-gray-400 font-medium">or</span>
                            </div>
                        </div>

                        {!showEmailForm ? (
                            <button
                                onClick={() => setShowEmailForm(true)}
                                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                <Mail size={18} />
                                Continue with Email
                            </button>
                        ) : (
                            <form onSubmit={handleEmailSubmit} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email" required placeholder="Email Address" autoFocus
                                        value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type={showPw ? 'text' : 'password'} required placeholder="Password"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium"
                                    />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="text-right">
                                    <Link to="/forgot-password" className="text-sm font-bold text-indigo-600 hover:underline">
                                        Forgot Password?
                                    </Link>
                                </div>
                                <button
                                    type="submit" disabled={loading}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Log In'}
                                </button>
                            </form>
                        )}

                        <p className="text-center text-sm text-gray-500 pt-2">
                            Don't have an account?{' '}
                            <Link to={`/register${redirectUrl ? '?redirect=' + encodeURIComponent(redirectUrl) : ''}`} className="font-bold text-indigo-600 hover:underline">Sign Up</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
