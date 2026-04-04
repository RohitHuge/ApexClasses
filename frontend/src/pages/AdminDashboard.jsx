import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCurrentUser } from '../utils/appwrite';
import { 
    Terminal, 
    ShieldAlert, 
    Zap, 
    CreditCard, 
    ArrowRight,
    Loader2,
    Lock,
    Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const u = await getCurrentUser();
        if (u && u.labels && u.labels.includes('admin')) {
            setUser(u);
            setIsAuthorized(true);
        } else {
            // Wait a bit to simulate a real loading then 404
            setTimeout(() => {
                setIsAuthorized(false);
                setLoading(false);
            }, 800);
            return;
        }
        setLoading(false);
    };

    const handleTestPayment = () => {
        navigate('/order?productId=admin_test_token');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="animate-spin text-indigo-500" size={40} />
            </div>
        );
    }

    // 404 Simulation for non-admins to keep the route hidden
    if (!isAuthorized) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                        <Search size={40} className="text-slate-300" />
                    </div>
                    <h1 className="text-6xl font-black text-slate-200 mb-4 tracking-tighter">404</h1>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
                    <p className="text-slate-500 max-w-sm mb-12">
                        The page you are looking for doesn't exist or has been moved. 
                        Please check the URL or return to home.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 transition-transform uppercase tracking-widest text-xs"
                    >
                        Go Home
                    </button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
                <div className="max-w-7xl mx-auto px-4 py-20">
                    
                    {/* Admin Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                <Terminal size={14} />
                                System Nexus: Restricted Area
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                                Admin <span className="text-indigo-500">Terminal.</span>
                            </h1>
                            <p className="text-slate-400 font-medium max-w-xl">
                                Welcome, {user.name}. You are currently in an encrypted testing environment. 
                                Use this portal to verify gateway synchronization.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-[32px] border border-white/10 backdrop-blur-xl">
                            <div className="w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <Lock size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Access Level</p>
                                <p className="text-xl font-black leading-none">ROOT_ADMIN</p>
                            </div>
                        </div>
                    </div>

                    {/* Test Suite */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Payment Verification Card */}
                        <div className="lg:col-span-2">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[40px] p-8 md:p-12 relative overflow-hidden group shadow-2xl shadow-indigo-900/20"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                                <div className="relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                        <div className="space-y-8">
                                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-[28px] flex items-center justify-center">
                                                <Zap size={40} className="text-white" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black tracking-tight leading-none uppercase">Gateway Sync</h3>
                                                <p className="text-indigo-100 font-medium opacity-80 leading-relaxed">
                                                    Verify the Razorpay integration with a low-cost live transaction. 
                                                    This will simulate a real order of ₹2.00.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={handleTestPayment}
                                                className="w-full md:w-auto px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-900/20 active:scale-95"
                                            >
                                                <CreditCard size={20} />
                                                Initiate Live Test (₹2)
                                                <ArrowRight size={18} />
                                            </button>
                                        </div>

                                        <div className="bg-black/20 p-8 rounded-[32px] border border-white/5 backdrop-blur-md space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-indigo-200">Terminal_Output:</h4>
                                            <div className="space-y-2 font-mono text-xs opacity-70">
                                                <p className="flex gap-2">
                                                    <span className="text-green-400">➜</span>
                                                    <span>Initializing Razorpay_SDK...</span>
                                                </p>
                                                <p className="flex gap-2">
                                                    <span className="text-green-400">➜</span>
                                                    <span>Fetching product: admin_test_token</span>
                                                </p>
                                                <p className="flex gap-2 text-indigo-300">
                                                    <span className="text-green-400">➜</span>
                                                    <span>Amount check: 2.00 INR (OK)</span>
                                                </p>
                                                <p className="flex gap-2 animate-pulse">
                                                    <span className="text-green-400">➜</span>
                                                    <span>Waiting for user interaction...</span>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Security Metrics */}
                        <div className="space-y-8">
                            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 relative overflow-hidden group">
                                <div className="absolute -inset-2 bg-indigo-500/10 blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                                <ShieldAlert size={48} className="text-indigo-500 mb-6 relative z-10" />
                                <h4 className="text-xl font-black uppercase tracking-tight mb-2 relative z-10">Nexus Logs</h4>
                                <p className="text-slate-500 text-sm font-medium mb-6 relative z-10">
                                    All administrative actions are encrypted and logged in our secure database.
                                </p>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sys_Health</span>
                                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Optimized</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gate_Sync</span>
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Authenticated</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Layout>
    );
}
