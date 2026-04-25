import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { orderService } from '../orderService';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, Clock, CheckCircle, Package, Receipt, ArrowRight, Loader2, Check, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import OrderTracking from './OrderTracking';
import Invoice from './Invoice';

const OrderHistory = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyingOrderId, setVerifyingOrderId] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    const isSuccess = searchParams.get('success') === 'true';
    const successOrderId = searchParams.get('orderId');

    useEffect(() => {
        if (!authLoading && !user) navigate('/login');
    }, [user, authLoading, navigate]);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const res = await orderService.getOrderHistory();
            if (res.success) setOrders(res.orders);
        } catch (err) {
            console.error('Fetch orders error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchOrders();
    }, [user]);

    const handleVerifyPayment = async (orderId) => {
        setVerifyingOrderId(orderId);
        const tId = toast.loading('Verifying payment with gateway...');
        try {
            const res = await orderService.verifyPaymentStatus(orderId);
            if (res.success) {
                if (res.status === 'SUCCESS') {
                    toast.success(res.message || 'Payment verified! Access granted.', { id: tId });
                    fetchOrders();
                } else {
                    toast.error(res.message || 'Payment is still pending.', { id: tId });
                }
            } else {
                toast.error(res.error || 'Verification failed.', { id: tId });
            }
        } catch {
            toast.error('System error during verification.', { id: tId });
        } finally {
            setVerifyingOrderId(null);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    const clearSuccess = () => {
        searchParams.delete('success');
        searchParams.delete('orderId');
        setSearchParams(searchParams);
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-8 md:py-16 px-4 selection:bg-indigo-100">
                <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
                    <AnimatePresence>
                        {isSuccess && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-center border-4 border-green-50 shadow-2xl shadow-green-100 relative overflow-hidden"
                            >
                                <button onClick={clearSuccess} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                                    <X size={16} className="text-gray-500" />
                                </button>
                                <div className="space-y-6">
                                    <motion.div
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                                        className="w-20 h-20 md:w-24 md:h-24 bg-green-500 text-white rounded-[28px] flex items-center justify-center mx-auto shadow-xl shadow-green-200 rotate-12"
                                    >
                                        <Check size={48} strokeWidth={3} />
                                    </motion.div>
                                    <div className="space-y-2">
                                        <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">Order Confirmed!</h1>
                                        <p className="text-gray-500 font-medium text-sm px-4">
                                            Order <span className="text-indigo-600 font-black">#{successOrderId?.slice(0, 8).toUpperCase()}</span> is being processed. A confirmation email has been sent.
                                        </p>
                                    </div>
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-3 pt-2">
                                        <button onClick={() => navigate('/order')} className="w-full md:w-auto px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all flex items-center justify-center gap-2 shadow-xl">
                                            <ShoppingBag size={18} /> Continue Shopping
                                        </button>
                                        <button onClick={clearSuccess} className="w-full md:w-auto px-8 py-4 bg-white text-gray-600 border-2 border-gray-100 rounded-2xl font-black text-sm hover:bg-gray-50 transition-all">
                                            View History
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isSuccess && (
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                            <div className="text-center md:text-left space-y-1">
                                <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">Order History</h2>
                                <p className="text-gray-500 font-medium uppercase tracking-widest text-[10px]">Your lifetime purchases with Apex Classes</p>
                            </div>
                            <div className="hidden md:flex p-3 bg-white rounded-2xl shadow-sm border border-gray-100 items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-900 leading-none mb-0.5">{user?.name}</p>
                                    <p className="text-[10px] font-bold text-gray-400 truncate max-w-[120px] leading-none">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {!Array.isArray(orders) || orders.length === 0 ? (
                        <div className="bg-white rounded-[40px] p-12 md:p-20 text-center border border-gray-100 shadow-2xl shadow-gray-200/50">
                            <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-[30px] flex items-center justify-center mx-auto mb-8 rotate-12">
                                <ShoppingBag size={48} />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">No orders yet.</h2>
                            <p className="text-gray-500 mt-3 mb-10 max-w-xs mx-auto font-medium">Ready to start your journey? Explore our premium courses and materials.</p>
                            <button onClick={() => navigate('/order')} className="w-full md:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95">
                                Start Your Journey
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 md:space-y-8">
                            {orders.map((order) => (
                                <motion.div layout key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-[32px] md:rounded-[40px] overflow-hidden border border-gray-50 shadow-xl shadow-gray-200/40 hover:shadow-2xl transition-all group">
                                    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4 md:gap-6">
                                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 text-indigo-600 rounded-2xl md:rounded-3xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                    <Package size={28} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl md:text-2xl font-black text-gray-900 capitalize tracking-tight leading-none mb-2">{order.product_type}</h3>
                                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                                        <Clock size={12} />
                                                        {new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between md:justify-end gap-6 bg-gray-50/50 md:bg-transparent p-4 md:p-0 rounded-2xl">
                                                <div className="text-left md:text-right">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-2">Order Price</p>
                                                    <p className="text-xl md:text-3xl font-black text-gray-900">₹{order.amount}</p>
                                                </div>
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-2 ${order.status === 'SUCCESS' ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-orange-500 text-white shadow-lg shadow-orange-100'}`}>
                                                    {order.status === 'SUCCESS' && <CheckCircle size={14} />}
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                            <div>
                                                <button onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                                                    className="flex items-center gap-2 text-indigo-600 font-black text-sm hover:translate-x-1 transition-transform">
                                                    {selectedOrderId === order.id ? 'Hide Details' : 'Tracking History'}
                                                    <ArrowRight size={16} className={selectedOrderId === order.id ? '-rotate-90 transition-transform' : 'transition-transform'} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-end gap-3">
                                                <button onClick={() => { setSelectedOrderId(order.id); setShowInvoice(true); }}
                                                    className="flex-1 md:flex-none px-5 py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all">
                                                    <Receipt size={18} /> Invoice
                                                </button>
                                                {order.status !== 'SUCCESS' && (
                                                    <button disabled={verifyingOrderId === order.id} onClick={() => handleVerifyPayment(order.id)}
                                                        className="flex-1 md:flex-none px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50">
                                                        {verifyingOrderId === order.id ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                                                        Verify Payment
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {selectedOrderId === order.id && !showInvoice && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="pt-8 border-t border-gray-100">
                                                        <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100 border-dashed">
                                                            <OrderTracking orderId={order.id} />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {showInvoice && selectedOrderId && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-hidden">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-[32px] md:rounded-[40px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
                                <button onClick={() => setShowInvoice(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10 transition-colors shadow-sm">
                                    <X size={20} className="text-gray-500" />
                                </button>
                                <div className="h-full overflow-y-auto">
                                    <Invoice order={orders.find((o) => o.id === selectedOrderId)} user={user} onClose={() => setShowInvoice(false)} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default OrderHistory;
