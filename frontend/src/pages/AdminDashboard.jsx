import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getCurrentUser } from '../utils/appwrite';
import { orderService } from '../order/orderService';
import { 
    Terminal, 
    ShieldAlert, 
    Zap, 
    CreditCard, 
    ArrowRight,
    Loader2,
    Lock,
    Search,
    ShoppingBag,
    TrendingUp,
    AlertCircle,
    User,
    Mail,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    Filter,
    ChevronDown,
    Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const DELIVERY_STATUSES = [
    { value: 'Processing', label: 'Processing', icon: <Clock size={14} />, color: 'text-orange-500 bg-orange-50 text-orange-600' },
    { value: 'Dispatched', label: 'Dispatched', icon: <Truck size={14} />, color: 'text-blue-500 bg-blue-50 text-blue-600' },
    { value: 'Out for Delivery', label: 'Out for Delivery', icon: <Zap size={14} />, color: 'text-indigo-500 bg-indigo-50 text-indigo-600' },
    { value: 'Delivered', label: 'Delivered', icon: <CheckCircle2 size={14} />, color: 'text-green-500 bg-green-50 text-green-600' }
];

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);
    
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAndFetchData();
    }, []);

    const checkAdminAndFetchData = async () => {
        try {
            const u = await getCurrentUser();
            if (u && u.labels && u.labels.includes('admin')) {
                setUser(u);
                setIsAuthorized(true);
                
                // Fetch Dashboard Data
                const [statsRes, ordersRes] = await Promise.all([
                    orderService.getAdminStats(),
                    orderService.getAdminOrders()
                ]);

                if (statsRes.success) setStats(statsRes.stats);
                if (ordersRes.success) setOrders(ordersRes.orders);

            } else {
                setTimeout(() => {
                    setIsAuthorized(false);
                    setLoading(false);
                }, 800);
                return;
            }
        } catch (error) {
            console.error('Admin Fetch Error:', error);
            toast.error('Failed to load administrative data');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateDelivery = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            const res = await orderService.updateDeliveryStatus(orderId, newStatus);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.order : o));
                toast.success(`Order status updated to ${newStatus}`);
            } else {
                throw new Error(res.error);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesFilter = filterStatus === 'ALL' || order.status === filterStatus;
            
            return matchesSearch && matchesFilter;
        });
    }, [orders, searchTerm, filterStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={40} />
                    <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Nexus_Protocol...</p>
                </div>
            </div>
        );
    }

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
            <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden relative">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-900/20 blur-[100px] -ml-24 -mb-24 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10">
                    
                    {/* Admin Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 md:mb-24">
                        <div className="space-y-4 text-center md:text-left">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest"
                            >
                                <Terminal size={14} />
                                System Nexus: Authorized Management
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                                Admin <span className="text-indigo-500">Terminal.</span>
                            </h1>
                            <p className="text-slate-400 font-medium max-w-xl">
                                System ready, {user.name}. View real-time transaction history and manage order fulfillment across all product categories.
                            </p>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 md:p-6 rounded-[32px] border border-white/10 backdrop-blur-xl shrink-0">
                            <div className="w-12 h-12 md:w-14 md:h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                <Lock size={24} className="md:size-28" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Access Level</p>
                                <p className="text-lg md:text-xl font-black leading-none uppercase tracking-tighter">ROOT_ADMIN</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Suite */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                        {[
                            { label: 'Total Revenue', value: `₹${(stats?.total_revenue || 0).toLocaleString()}`, icon: <TrendingUp className="text-green-400" />, sub: `${stats?.success_orders} Successful Purchases` },
                            { label: 'Success Rate', value: `${stats?.total_orders > 0 ? Math.round((stats?.success_orders / stats?.total_orders) * 100) : 0}%`, icon: <CheckCircle2 className="text-indigo-400" />, sub: 'Payment Completion' },
                            { label: 'Failure Rate', value: `${stats?.total_orders > 0 ? Math.round((stats?.failed_orders / stats?.total_orders) * 100) : 0}%`, icon: <AlertCircle className="text-red-400" />, sub: 'Failed Transitions' },
                            { label: 'Active Queue', value: stats?.pending_orders || 0, icon: <Clock className="text-orange-400" />, sub: 'Awaiting Verification' }
                        ].map((s, i) => (
                            <motion.div 
                                key={s.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/5 p-8 rounded-[40px] border border-white/10 hover:bg-white/10 transition-colors group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[80px] transition-all group-hover:scale-110" />
                                <div className="space-y-4 relative z-10">
                                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center">
                                        {s.icon}
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{s.label}</h4>
                                        <p className="text-3xl font-black tracking-tight">{s.value}</p>
                                        <p className="text-slate-500 text-xs mt-2 font-medium opacity-70 italic">{s.sub}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Management Table */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-[48px] border border-white/10 backdrop-blur-xl overflow-hidden shadow-[0_0_80px_rgba(79,70,229,0.05)]"
                    >
                        {/* Table Header / Toolbar */}
                        <div className="p-8 md:p-12 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black uppercase tracking-tight">System Logs</h3>
                                <p className="text-slate-400 text-sm font-medium">Real-time sync of all across Apex Classes ecosystem.</p>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                                <div className="relative w-full md:w-80 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by Email or Order ID..."
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 focus:bg-white/10 outline-none transition-all placeholder:text-slate-600 font-medium text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex items-center gap-2 w-full md:w-auto">
                                    <div className="relative flex-1 md:flex-none">
                                        <select 
                                            className="w-full md:w-40 px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-indigo-500 outline-none transition-all appearance-none font-bold text-xs uppercase tracking-widest cursor-pointer"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="ALL" className="bg-slate-900">All Status</option>
                                            <option value="SUCCESS" className="bg-slate-900 text-green-400 font-bold">Success</option>
                                            <option value="PENDING" className="bg-slate-900 text-orange-400 font-bold">Pending</option>
                                            <option value="FAILED" className="bg-slate-900 text-red-400 font-bold">Failed</option>
                                        </select>
                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                    </div>
                                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors shrink-0">
                                        <Download size={20} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Table Body */}
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1000px]">
                                <thead>
                                    <tr className="bg-white/5 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 text-left">
                                        <th className="px-8 py-6">Order Details</th>
                                        <th className="px-8 py-6">Customer</th>
                                        <th className="px-8 py-6">Transaction</th>
                                        <th className="px-8 py-6">Status Management</th>
                                        <th className="px-8 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-32 text-center">
                                                <div className="max-w-xs mx-auto space-y-4">
                                                    <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto text-slate-700">
                                                        <Search size={32} />
                                                    </div>
                                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No matches found in Nexus logs</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/5 text-indigo-500 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all cursor-default relative overflow-hidden">
                                                        <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <Package size={24} className="relative z-10" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-white capitalize leading-none mb-1">{order.product_type.replace('_', ' ')}</p>
                                                        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {order.id.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-200">
                                                        <User size={12} className="text-indigo-400" />
                                                        {order.user_name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                        <Mail size={12} />
                                                        {order.user_email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-white">₹{order.amount.toLocaleString()}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                                        <CreditCard size={10} />
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-8">
                                                {order.status === 'SUCCESS' && (order.product_type === 'book' || order.product_type === 'counselling_offline') ? (
                                                    <div className="relative group/status w-48">
                                                        <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover/status:border-indigo-500/50 transition-all ${updatingId === order.id ? 'opacity-50' : ''}`}>
                                                            <div className="flex items-center gap-2">
                                                                {DELIVERY_STATUSES.find(s => s.value === (order.metadata?.delivery_status || 'Processing'))?.icon}
                                                                {order.metadata?.delivery_status || 'Processing'}
                                                            </div>
                                                            <ChevronDown size={14} className="text-slate-500 group-hover/status:text-indigo-400" />
                                                        </div>
                                                        
                                                        <div className="absolute top-full left-0 mt-2 w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden p-2 z-[100] opacity-0 translate-y-2 pointer-events-none group-hover/status:opacity-100 group-hover/status:translate-y-0 group-hover/status:pointer-events-auto transition-all shadow-2xl">
                                                            {DELIVERY_STATUSES.map((s) => (
                                                                <button 
                                                                    key={s.value}
                                                                    onClick={() => handleUpdateDelivery(order.id, s.value)}
                                                                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest hover:bg-white/5 ${order.metadata?.delivery_status === s.value ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-400'}`}
                                                                >
                                                                    {s.icon}
                                                                    {s.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase ${
                                                        order.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                                                        order.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                                                        'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-8 text-right">
                                                <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-indigo-500/30 transition-all">
                                                    <ArrowRight size={16} className="text-slate-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
}
