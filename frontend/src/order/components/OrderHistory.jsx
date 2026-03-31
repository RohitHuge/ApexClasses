import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { orderService } from '../orderService';
import { getCurrentUser } from '../../utils/appwrite';
import { ShoppingBag, Clock, CheckCircle, Package, Receipt, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import OrderTracking from './OrderTracking';
import Invoice from './Invoice';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const u = await getCurrentUser();
            if (!u) {
                navigate('/order'); // Redirect to order if not logged in
                return;
            }
            setUser(u);
            const res = await orderService.getOrderHistory(u.$id);
            if (res.success) {
                setOrders(res.orders);
            }
            setLoading(false);
        };
        fetchOrders();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-indigo-600" size={40} />
            </div>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Orders</h1>
                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                                 {user?.name?.charAt(0) || 'U'}
                             </div>
                             <div className="text-sm">
                                 <p className="font-bold text-gray-900">{user?.name}</p>
                                 <p className="text-gray-500">{user?.email}</p>
                             </div>
                        </div>
                    </div>

                    {!Array.isArray(orders) || orders.length === 0 ? (
                        <div className="bg-white rounded-[32px] p-12 text-center border border-gray-100 shadow-xl shadow-gray-200/50">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                                 <ShoppingBag size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">No orders yet</h2>
                            <p className="text-gray-500 mt-2 mb-8">You haven't placed any orders with us yet.</p>
                            <button onClick={() => navigate('/order')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="p-6 md:p-8">
                                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Package size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 capitalize">{order.product_type}</h3>
                                                    <p className="text-sm text-gray-500">Ordered on {new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase ${order.status === 'SUCCESS' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-xl font-black text-gray-900">₹{order.amount}</span>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                            <div className="space-y-2">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tracking History</p>
                                                <button 
                                                    onClick={() => setSelectedOrderId(selectedOrderId === order.id ? null : order.id)}
                                                    className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline"
                                                >
                                                    {selectedOrderId === order.id ? 'Hide Tracking' : 'View Tracking Detail'}
                                                    <ArrowRight size={14} className={selectedOrderId === order.id ? '-rotate-90 transition-all' : ''} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-end gap-3">
                                                <button 
                                                    onClick={() => { setSelectedOrderId(order.id); setShowInvoice(true); }}
                                                    className="px-4 py-2 border border-gray-100 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all"
                                                >
                                                    <Receipt size={16} /> Invoice
                                                </button>
                                                <button className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all">
                                                    Buy Again
                                                </button>
                                            </div>
                                        </div>

                                        {selectedOrderId === order.id && !showInvoice && (
                                            <div className="mt-8 pt-8 border-t border-gray-50">
                                                <OrderTracking orderId={order.id} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showInvoice && selectedOrderId && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative">
                             <button onClick={() => setShowInvoice(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10">
                                <ShoppingBag size={20} />
                             </button>
                             <Invoice order={orders.find(o => o.id === selectedOrderId)} user={user} onClose={() => setShowInvoice(false)} />
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default OrderHistory;
