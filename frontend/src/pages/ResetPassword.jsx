import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { resetPassword } from '../utils/auth';
import { Lock, Loader2, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);

    if (!token) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-gray-900">Invalid Reset Link</h2>
                        <Link to="/forgot-password" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Request a new one</Link>
                    </div>
                </div>
            </Layout>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        if (password !== confirm) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            await resetPassword(token, password);
            setDone(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            toast.error(err.message || 'Reset failed. The link may have expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Set New Password</h1>
                        <p className="text-gray-500 mt-2 font-medium">Choose a secure password for your account</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100">
                        {done ? (
                            <div className="text-center space-y-4 py-4">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-black text-gray-900">Password Set!</h3>
                                <p className="text-gray-500 text-sm">Redirecting you to login...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type={showPw ? 'text' : 'password'} required placeholder="New Password (min 6 chars)"
                                        value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type={showPw ? 'text' : 'password'} required placeholder="Confirm Password"
                                        value={confirm} onChange={(e) => setConfirm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 size={20} className="animate-spin" /> : 'Set Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
