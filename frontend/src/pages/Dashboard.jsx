import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCurrentUser } from '../utils/appwrite';
import { orderService } from '../order/orderService';
import { 
    LayoutDashboard, 
    BookOpen, 
    ShoppingBag, 
    ArrowRight, 
    Clock, 
    CheckCircle, 
    User, 
    ShieldCheck, 
    Zap,
    GraduationCap,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const u = await getCurrentUser();
        if (!u) {
            navigate('/');
            return;
        }
        setUser(u);
        
        try {
            const res = await orderService.getOrderHistory(u.$id);
            if (res.success) {
                setOrders(res.orders);
            }
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const bookOrder = orders.find(o => 
        o.product_type === 'book' && o.mode === 'online' && o.status === 'SUCCESS'
    );
    const hasOnlineBook = !!bookOrder;

    const successfulOrders = orders.filter(o => o.status === 'SUCCESS');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-50 selection:bg-indigo-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div className="space-y-2">
                             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                <Zap size={12} fill="currentColor" />
                                Student Portal v2.0
                             </div>
                             <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
                                Welcome back, <span className="text-indigo-600">{user?.name.split(' ')[0]}!</span>
                             </h1>
                             <p className="text-slate-500 font-medium max-w-xl">
                                Your central hub for academic excellence and career guidance. Access your materials, track your orders, and explore new opportunities.
                             </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Services</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{successfulOrders.length}</p>
                                </div>
                             </div>
                             <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center">
                                    <GraduationCap size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Success Rate</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">100%</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Left Column: Primary Actions */}
                        <div className="lg:col-span-2 space-y-8">
                            
                            {/* Read Book Section (Prominent) */}
                            {hasOnlineBook ? (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-indigo-600 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200"
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-bl-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                        <div className="space-y-6">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                                <BookOpen size={32} className="text-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Your Guide is Ready.</h2>
                                                <p className="text-indigo-100 font-medium opacity-90 leading-relaxed">
                                                    The MHT-CET Engineering Admission Guide 2026 is available in your digital library.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/view-book/${bookOrder.id}`)}
                                                className="w-full md:w-auto px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 active:scale-95"
                                            >
                                                <BookOpen size={24} />
                                                Read Book
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                        <div className="hidden md:flex justify-end">
                                            <img 
                                                src="https://ik.imagekit.io/apexcounselling/Gemini_Generated_Image_e4o9y0e4o9y0e4o9.png" 
                                                alt="Book Preview" 
                                                className="w-64 h-auto rounded-xl shadow-2xl rotate-6 group-hover:rotate-0 transition-all duration-700 hover:scale-105"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-slate-900 rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-bl-full -mr-20 -mt-20" />
                                    <div className="relative z-10 space-y-6 max-w-lg">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                                            <ShieldCheck size={32} className="text-indigo-400" />
                                        </div>
                                        <div className="space-y-2">
                                            <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">Master MHT-CET 2026.</h2>
                                            <p className="text-slate-400 font-medium leading-relaxed">
                                                You haven't unlocked the Engineering Admission Guide yet. Get instant digital access and start planning your future today.
                                            </p>
                                        </div>
                                        <Link to="/book" className="inline-block">
                                            <button className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/40">
                                                Get the Guide
                                                <ArrowRight size={20} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Recent Orders Section */}
                            <div className="bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-sm">
                                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                                        <ShoppingBag size={24} className="text-indigo-600" />
                                        Recent Orders
                                    </h3>
                                    <Link to="/orders" className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1">
                                        View All
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {orders.slice(0, 3).map((order) => (
                                        <div key={order.id} className="p-6 md:p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-xl flex items-center justify-center font-black">
                                                    {order.product_type.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-black text-slate-900 capitalize text-sm md:text-base leading-none mb-1">{order.product_type}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-black text-slate-900 text-sm md:text-base mb-1">₹{order.amount}</p>
                                                <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${order.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {orders.length === 0 && (
                                        <div className="p-12 text-center text-slate-400 font-medium">
                                            No orders found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Profile & Extras */}
                        <div className="space-y-8">
                            
                            {/* Profile Card */}
                            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm relative overflow-hidden text-center">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        <User size={20} />
                                    </div>
                                </div>
                                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-[32px] mx-auto mb-6 flex items-center justify-center border-4 border-white shadow-xl">
                                    <span className="text-3xl font-black text-indigo-600">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-1">{user?.name}</h3>
                                <p className="text-slate-500 text-sm font-medium mb-6">{user?.email}</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                        <p className="text-xs font-black text-slate-900">Student</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined</p>
                                        <p className="text-xs font-black text-slate-900">2026</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="bg-white rounded-[40px] p-8 border border-slate-200 shadow-sm">
                                <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
                                    <ExternalLink size={20} className="text-indigo-600" />
                                    Explore More
                                </h4>
                                <div className="space-y-4">
                                    <Link to="/services" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 group transition-all">
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-600">Online Counselling</span>
                                        <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/track-record" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 group transition-all">
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-600">Admission Records</span>
                                        <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link to="/jlpt-n5" className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-indigo-50 group transition-all">
                                        <span className="font-bold text-slate-700 group-hover:text-indigo-600">Japanese Courses</span>
                                        <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    );
}
