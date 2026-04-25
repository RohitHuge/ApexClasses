import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    if (user) { navigate('/dashboard'); return null; }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const u = await login(email, password);
            toast.success(`Welcome back, ${u.name.split(' ')[0]}!`);
            navigate(u.role === 'admin' ? '/admin/nexus-terminal' : '/dashboard');
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
                        <p className="text-gray-500 mt-2 font-medium">Log in to your Apex Classes account</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email" required placeholder="Email Address"
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

                        <p className="text-center mt-6 text-sm text-gray-500">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:underline">Sign Up</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
