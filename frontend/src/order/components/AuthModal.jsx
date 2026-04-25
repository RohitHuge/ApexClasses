import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Smartphone, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await login(form.email, form.password);
            } else {
                if (form.password.length < 6) {
                    setError('Password must be at least 6 characters');
                    return;
                }
                await register(form.name, form.email, form.phone, form.password);
            }
            onSuccess?.();
            onClose?.();
        } catch (err) {
            if (err.code === 'PASSWORD_NOT_SET') {
                setError('Please set your password first. Use the "Forgot Password" link below.');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
                <div className="relative p-8">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {isLogin ? 'Login to finalize your order' : 'Join us to track your orders easily'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="text" placeholder="Full Name" required value={form.name} onChange={set('name')}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="relative">
                                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="tel" placeholder="Mobile Number (optional)" value={form.phone} onChange={set('phone')}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                                </div>
                            </>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="email" placeholder="Email Address" required value={form.email} onChange={set('email')}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type={showPw ? 'text' : 'password'} placeholder="Password" required value={form.password} onChange={set('password')}
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {isLogin && (
                            <div className="text-right">
                                <Link to="/forgot-password" onClick={onClose} className="text-sm font-bold text-indigo-600 hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                        )}

                        {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded-lg text-center">{error}</p>}

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-indigo-600 font-medium hover:underline transition-all">
                            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default AuthModal;
