import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Mail, Lock, User, Smartphone, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Register() {
    const { register, user } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    if (user) { navigate('/dashboard'); return null; }

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const u = await register(form.name, form.email, form.phone, form.password);
            toast.success('Account created! Welcome to Apex Classes.');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.message || 'Registration failed');
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
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Create Account</h1>
                        <p className="text-gray-500 mt-2 font-medium">Join Apex Classes today</p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/60 border border-gray-100">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" required placeholder="Full Name" value={form.name} onChange={set('name')}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" required placeholder="Email Address" value={form.email} onChange={set('email')}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div className="relative">
                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="tel" placeholder="Mobile Number (optional)" value={form.phone} onChange={set('phone')}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type={showPw ? 'text' : 'password'} required placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')}
                                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                {loading ? <Loader2 size={20} className="animate-spin" /> : 'Create Account'}
                            </button>
                        </form>

                        <p className="text-center mt-6 text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-indigo-600 hover:underline">Log In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
}
