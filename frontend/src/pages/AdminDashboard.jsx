import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../order/orderService';
import {
    Terminal, Zap, CreditCard, ArrowRight, Loader2, Lock, Search, ShoppingBag,
    TrendingUp, AlertCircle, User, Mail, Package, Truck, CheckCircle2, Clock,
    Filter, ChevronDown, Download, Users, Calendar, Plus, Trash2, Edit3,
    Send, Shield, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

const DELIVERY_STATUSES = [
    { value: 'PROCESSING', label: 'Processing', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    { value: 'PACKED', label: 'Packed', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    { value: 'SHIPPED', label: 'Shipped', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    { value: 'DELIVERED', label: 'Delivered', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
];

const TABS = ['Orders', 'Slots', 'Users'];

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('Orders');
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [updatingId, setUpdatingId] = useState(null);
    const [trackingInput, setTrackingInput] = useState({});
    const [showSlotForm, setShowSlotForm] = useState(false);
    const [slotForm, setSlotForm] = useState({ product_id: 'counselling_online', slot_time: '', capacity: 1, notes: '' });

    useEffect(() => {
        fetchAll();
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, ordersRes] = await Promise.all([
                orderService.getAdminStats(),
                orderService.getAdminOrders(),
            ]);
            if (statsRes.success) setStats(statsRes.stats);
            if (ordersRes.success) setOrders(ordersRes.orders);
        } catch (err) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await orderService.getAdminUsers();
            if (res.success) setUsers(res.users);
        } catch { toast.error('Failed to load users'); }
    };

    const fetchSlots = async () => {
        try {
            const res = await orderService.getAdminSlots();
            if (res.success) setSlots(res.slots);
        } catch { toast.error('Failed to load slots'); }
    };

    useEffect(() => {
        if (activeTab === 'Users' && users.length === 0) fetchUsers();
        if (activeTab === 'Slots' && slots.length === 0) fetchSlots();
    }, [activeTab]);

    const handleUpdateDelivery = async (orderId, status) => {
        const tracking = trackingInput[orderId] || '';
        setUpdatingId(orderId);
        try {
            const res = await orderService.updateDeliveryStatus(orderId, status, tracking);
            if (res.success) {
                setOrders((prev) => prev.map((o) => o.id === orderId ? res.order : o));
                toast.success(`Status updated to ${status}`);
            } else throw new Error(res.error);
        } catch (err) {
            toast.error(err.message || 'Failed to update');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateRole = async (userId, role) => {
        try {
            const res = await orderService.updateUserRole(userId, role);
            if (res.success) {
                setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
                toast.success(`Role updated to ${role}`);
            } else throw new Error(res.error);
        } catch (err) {
            toast.error(err.message || 'Failed to update role');
        }
    };

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            const res = await orderService.createSlot(slotForm);
            if (res.success) {
                setSlots((prev) => [res.slot, ...prev]);
                setShowSlotForm(false);
                setSlotForm({ product_id: 'counselling_online', slot_time: '', capacity: 1, notes: '' });
                toast.success('Slot created');
            } else throw new Error(res.error);
        } catch (err) {
            toast.error(err.message || 'Failed to create slot');
        }
    };

    const handleToggleSlot = async (slotId, currentActive) => {
        try {
            const res = await orderService.updateSlot(slotId, { is_active: !currentActive });
            if (res.success) {
                setSlots((prev) => prev.map((s) => s.id === slotId ? res.slot : s));
                toast.success(res.slot.is_active ? 'Slot activated' : 'Slot deactivated');
            }
        } catch { toast.error('Failed to update slot'); }
    };

    const handleSendMigrationEmails = async () => {
        const tId = toast.loading('Sending migration emails...');
        try {
            const res = await orderService.sendMigrationEmails();
            toast.success(`Sent ${res.sent} emails`, { id: tId });
        } catch { toast.error('Failed to send emails', { id: tId }); }
    };

    const filteredOrders = useMemo(() => orders.filter((o) => {
        const matchSearch = !searchTerm ||
            o.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
        return matchSearch && matchStatus;
    }), [orders, searchTerm, filterStatus]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center space-y-4">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto" size={40} />
                    <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing Nexus...</p>
                </div>
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] -mr-48 -mt-48 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 relative z-10">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                <Terminal size={14} /> System Nexus: Admin Terminal
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase italic">
                                Admin <span className="text-indigo-500">Terminal.</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[24px] border border-white/10">
                                <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
                                    <Lock size={22} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Logged in as</p>
                                    <p className="text-base font-black leading-none">{user?.name}</p>
                                </div>
                            </div>
                            <button onClick={logout} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-red-400 hover:border-red-500/30 transition-all text-xs font-bold uppercase tracking-widest">
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
                        {[
                            { label: 'Revenue', value: `₹${Number(stats?.total_revenue || 0).toLocaleString()}`, icon: <TrendingUp className="text-green-400" size={20} /> },
                            { label: 'Success', value: stats?.success_orders || 0, icon: <CheckCircle2 className="text-indigo-400" size={20} /> },
                            { label: 'Pending', value: stats?.pending_orders || 0, icon: <Clock className="text-orange-400" size={20} /> },
                            { label: 'Failed', value: stats?.failed_orders || 0, icon: <AlertCircle className="text-red-400" size={20} /> },
                            { label: 'To Ship', value: stats?.pending_shipments || 0, icon: <Truck className="text-blue-400" size={20} /> },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/5 p-5 rounded-[24px] border border-white/10 flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">{s.icon}</div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                                    <p className="text-xl font-black">{s.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl w-fit">
                        {TABS.map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}>
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* ── ORDERS TAB ── */}
                    {activeTab === 'Orders' && (
                        <div className="bg-white/5 rounded-[40px] border border-white/10 overflow-hidden">
                            <div className="p-6 md:p-10 border-b border-white/5 flex flex-col lg:flex-row items-center justify-between gap-6">
                                <h3 className="text-xl font-black uppercase tracking-tight">All Orders</h3>
                                <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative w-full md:w-72">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input type="text" placeholder="Search email, name, order ID..."
                                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none text-sm font-medium placeholder:text-slate-600"
                                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                                    </div>
                                    <div className="relative">
                                        <select className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none appearance-none font-bold text-xs uppercase tracking-widest cursor-pointer pr-8"
                                            value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                            <option value="ALL" className="bg-slate-900">All Status</option>
                                            <option value="SUCCESS" className="bg-slate-900">Success</option>
                                            <option value="PENDING" className="bg-slate-900">Pending</option>
                                            <option value="FAILED" className="bg-slate-900">Failed</option>
                                        </select>
                                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                    </div>
                                    <button onClick={fetchAll} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors shrink-0">
                                        <RefreshCw size={16} className="text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[900px]">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-left">
                                            <th className="px-8 py-5">Order</th>
                                            <th className="px-8 py-5">Customer</th>
                                            <th className="px-8 py-5">Amount</th>
                                            <th className="px-8 py-5">Payment</th>
                                            <th className="px-8 py-5">Delivery (Offline Book)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredOrders.length === 0 ? (
                                            <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold text-sm">No orders found</td></tr>
                                        ) : filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/5 text-indigo-400 rounded-xl flex items-center justify-center">
                                                            <Package size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black capitalize leading-none mb-1">{order.product_type} ({order.mode})</p>
                                                            <p className="text-[10px] font-mono text-slate-500">#{order.id.slice(0, 8)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2 text-xs font-black text-slate-200">
                                                            <User size={11} className="text-indigo-400" />{order.user_name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                            <Mail size={11} />{order.user_email}
                                                        </div>
                                                        {order.slot_time && (
                                                            <div className="flex items-center gap-2 text-[10px] text-indigo-400">
                                                                <Calendar size={11} />
                                                                {new Date(order.slot_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <p className="text-sm font-black">₹{order.amount}</p>
                                                    <p className="text-[10px] text-slate-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border ${
                                                        order.status === 'SUCCESS' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        order.status === 'FAILED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                    }`}>{order.status}</span>
                                                </td>
                                                <td className="px-8 py-6">
                                                    {order.status === 'SUCCESS' && order.product_type === 'book' && order.mode === 'offline' ? (
                                                        <div className="space-y-2">
                                                            <input
                                                                type="text" placeholder="Tracking info (optional)"
                                                                value={trackingInput[order.id] || ''}
                                                                onChange={(e) => setTrackingInput((p) => ({ ...p, [order.id]: e.target.value }))}
                                                                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs outline-none focus:border-indigo-500 placeholder:text-slate-600"
                                                            />
                                                            <div className="relative">
                                                                <select
                                                                    disabled={updatingId === order.id}
                                                                    onChange={(e) => { if (e.target.value) handleUpdateDelivery(order.id, e.target.value); }}
                                                                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer focus:border-indigo-500 disabled:opacity-50"
                                                                >
                                                                    <option value="" className="bg-slate-900">{order.metadata?.delivery_status || 'Set Status'}</option>
                                                                    {DELIVERY_STATUSES.map((s) => (
                                                                        <option key={s.value} value={s.value} className="bg-slate-900">{s.label}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-600 text-xs">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── SLOTS TAB ── */}
                    {activeTab === 'Slots' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tight">Counselling Slots</h3>
                                <button onClick={() => setShowSlotForm(!showSlotForm)}
                                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    <Plus size={16} /> New Slot
                                </button>
                            </div>

                            <AnimatePresence>
                                {showSlotForm && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                        className="bg-white/5 rounded-[24px] border border-white/10 p-6">
                                        <form onSubmit={handleCreateSlot} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Product</label>
                                                <select value={slotForm.product_id} onChange={(e) => setSlotForm({ ...slotForm, product_id: e.target.value })}
                                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl outline-none appearance-none text-sm font-medium cursor-pointer">
                                                    <option value="counselling_online" className="bg-slate-900">Online Counselling</option>
                                                    <option value="counselling_offline" className="bg-slate-900">Offline Counselling</option>
                                                    <option value="counselling_complete" className="bg-slate-900">Complete Guidance</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Date & Time</label>
                                                <input type="datetime-local" required value={slotForm.slot_time} onChange={(e) => setSlotForm({ ...slotForm, slot_time: e.target.value })}
                                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-sm font-medium focus:border-indigo-500" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Capacity</label>
                                                <input type="number" min="1" value={slotForm.capacity} onChange={(e) => setSlotForm({ ...slotForm, capacity: parseInt(e.target.value) })}
                                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-sm font-medium focus:border-indigo-500" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Notes</label>
                                                <input type="text" placeholder="e.g. Zoom link, room no..." value={slotForm.notes} onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                                                    className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl outline-none text-sm font-medium focus:border-indigo-500 placeholder:text-slate-600" />
                                            </div>
                                            <div className="md:col-span-2 lg:col-span-4 flex gap-3">
                                                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Create Slot</button>
                                                <button type="button" onClick={() => setShowSlotForm(false)} className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">Cancel</button>
                                            </div>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-left">
                                                <th className="px-8 py-5">Product</th>
                                                <th className="px-8 py-5">Date & Time</th>
                                                <th className="px-8 py-5">Bookings</th>
                                                <th className="px-8 py-5">Notes</th>
                                                <th className="px-8 py-5 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {slots.length === 0 ? (
                                                <tr><td colSpan="5" className="px-8 py-20 text-center text-slate-500 font-bold text-sm">No slots created yet</td></tr>
                                            ) : slots.map((slot) => (
                                                <tr key={slot.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-black capitalize">{slot.product_id.replace(/_/g, ' ')}</p>
                                                        <p className="text-[10px] font-mono text-slate-500">#{slot.id.slice(0, 8)}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <p className="text-sm font-bold">{new Date(slot.slot_time).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                                        <p className="text-[10px] text-slate-500">{new Date(slot.slot_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`h-2 rounded-full ${slot.booked >= slot.capacity ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min((slot.booked / slot.capacity) * 60, 60)}px` }} />
                                                            <span className="text-sm font-black">{slot.booked}/{slot.capacity}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm text-slate-400">{slot.notes || '—'}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button onClick={() => handleToggleSlot(slot.id, slot.is_active)}
                                                            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${slot.is_active ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-slate-700/50 text-slate-500 border-slate-600 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}>
                                                            {slot.is_active ? 'Active' : 'Inactive'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── USERS TAB ── */}
                    {activeTab === 'Users' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase tracking-tight">All Users ({users.length})</h3>
                                <button onClick={handleSendMigrationEmails}
                                    className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    <Send size={14} /> Send Migration Emails
                                </button>
                            </div>
                            <div className="bg-white/5 rounded-[32px] border border-white/10 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[700px]">
                                        <thead>
                                            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-left">
                                                <th className="px-8 py-5">User</th>
                                                <th className="px-8 py-5">Phone</th>
                                                <th className="px-8 py-5">Orders</th>
                                                <th className="px-8 py-5">Total Spent</th>
                                                <th className="px-8 py-5 text-right">Role</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {users.map((u) => (
                                                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center font-black text-sm">
                                                                {u.name?.charAt(0) || '?'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black">{u.name}</p>
                                                                <p className="text-[10px] text-slate-500">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-sm text-slate-400">{u.phone || '—'}</td>
                                                    <td className="px-8 py-5 text-sm font-black">{u.order_count}</td>
                                                    <td className="px-8 py-5 text-sm font-black">₹{Number(u.total_spent).toLocaleString()}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <select value={u.role}
                                                            onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                                            className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border appearance-none cursor-pointer outline-none ${u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-slate-400 border-white/10'}`}>
                                                            <option value="user" className="bg-slate-900">User</option>
                                                            <option value="admin" className="bg-slate-900">Admin</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
}
