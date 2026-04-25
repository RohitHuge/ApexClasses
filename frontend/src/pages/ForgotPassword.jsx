import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { forgotPassword } from '../utils/auth';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email') || '');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPassword(email);
            setSent(true);
        } catch {
            setSent(true); // Still show success to prevent email enumeration
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Forgot Password</h1>
                        <p className="text-gray-500 mt-2 font-medium">We'll send a reset link to your email</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100">
                        {sent ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Check Your Inbox</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
                                </p>
                                <Link to="/login" className="inline-block mt-4 text-sm font-bold text-indigo-600 hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" required placeholder="Your Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Send Reset Link'}
                                </button>
                                <p className="text-center text-sm text-gray-500">
                                    <Link to="/login" className="font-bold text-indigo-600 hover:underline">Back to Login</Link>
                                </p>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
