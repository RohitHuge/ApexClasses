import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BATCHES } from './orderTypes';
import { useProducts } from '../context/ProductContext';
import { orderService } from './orderService';
import { getCurrentUser } from '../utils/appwrite';
import AuthModal from './components/AuthModal';
import { loadRazorpayScript } from './utils/loadRazorpay';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ShoppingBag, MapPin, Calendar, CreditCard, ArrowLeft, Loader2, ShieldCheck, XCircle, User, Mail, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OrderPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { products, loading: productsLoading } = useProducts();
    const socketRef = useRef(null);
    
    // State
    const productId = searchParams.get('productId') || searchParams.get('type') || 'book_offline';
    const product = products[productId] || products['book_offline'];
    
    const [step, setStep] = useState(1);
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, success, failed
    const [paymentError, setPaymentError] = useState(null);
    const redirectingRef = useRef(false);
    
    // Form Data
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        state: '',
        pincode: '',
        slot: '',
        topic: '',
        batch: searchParams.get('batch') || 'N5',
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        checkUser();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const checkUser = async () => {
        const u = await getCurrentUser();
        if (!u) {
            setShowAuth(true);
            return;
        }
        setUser(u);
        syncFormData(u);
    };

    const syncFormData = async (u) => {
        setLoading(true);
        try {
            // Fetch local profile for phone
            const profileRes = await orderService.getUserProfile(u.$id);
            const localUser = profileRes.user || {};

            setFormData(prev => ({
                ...prev,
                name: u.name || prev.name,
                email: u.email || prev.email,
                phone: localUser.phone || prev.phone
            }));
        } catch (error) {
            console.error('Error syncing profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupSocket = async (userId) => {
        if (socketRef.current) return;
        
        try {
            const socket = await orderService.getSocket(userId);
            socketRef.current = socket;

            socket.on('payment_success', (data) => {
                console.log('✅ Payment Success:', data);
                if (redirectingRef.current) return;
                
                setPaymentStatus('success');
                setLoading(false);
                redirectingRef.current = true;
                
                toast.success('Payment Verified! Redirecting...');
                setTimeout(() => {
                    navigate(`/orders?success=true&orderId=${data.orderId}`, { replace: true });
                }, 2000);
            });

            socket.on('payment_failed', (data) => {
                console.error('❌ Payment Failed:', data);
                if (redirectingRef.current) return;
                setPaymentStatus('failed');
                setPaymentError(data.error || 'Transaction failed');
                setLoading(false);
                toast.error('Payment Failed. Please try again.');
            });

            socket.on('connect_error', (err) => {
                console.error('Socket Connection Error:', err.message);
            });
        } catch (err) {
            console.error('Socket Setup Error:', err);
        }
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePayment = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        
        setLoading(true);
        setPaymentStatus('processing');
        
        try {
            // 1. Setup WebSocket for real-time confirmation
            await setupSocket(user.$id);

            // 2. Lazy load Razorpay script
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Payment system failed to load. Check your connection.');
                setPaymentStatus('failed');
                setLoading(false);
                return;
            }

            // 3. Create Order in our DB
            const orderRes = await orderService.createOrder({
                user_id: user.$id,
                productId: productId,
                metadata: formData
            });

            if (!orderRes.success) throw new Error(orderRes.error || 'Failed to create order');
            setOrder(orderRes.order);

            // 4. Create Razorpay Payment Order
            const payOrderRes = await orderService.createPaymentOrder(orderRes.order.id, user.$id);
            if (!payOrderRes.success) throw new Error(payOrderRes.error || 'Failed to initialize payment');

            // 5. Open Razorpay Popup
            const options = {
                key: payOrderRes.key,
                amount: payOrderRes.amount,
                currency: "INR",
                name: "Apex Classes",
                description: `Payment for ${product.title}`,
                order_id: payOrderRes.razorpayOrderId,
                handler: function (response) {
                    console.log('Razorpay Handler Response:', response);
                    // WebSocket handles navigation, but we lock the state here to prevent resets
                    setPaymentStatus('success');
                },
                prefill: {
                    name: formData.name || user.name,
                    email: formData.email || user.email,
                    contact: formData.phone || user.phone
                },
                theme: {
                    color: "#4f46e5"
                },
                modal: {
                    ondismiss: function() {
                        setPaymentStatus(prev => {
                            if (prev === 'success' || redirectingRef.current) return prev;
                            setLoading(false);
                            toast('Payment popup closed. You can retry.', { icon: 'ℹ️' });
                            return 'idle';
                        });
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Payment Initialization Error:', error);
            toast.error(error.message || 'Something went wrong');
            setPaymentStatus('failed');
            setLoading(false);
        }
    };

    if (productsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6 md:space-y-8">
                        <div className="bg-gray-50/50 rounded-3xl p-5 md:p-6 border border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <ShoppingBag size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none mb-1">Service Selecting</p>
                                    <h3 className="text-sm md:text-base font-black text-gray-900 truncate">{product.title}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Price</p>
                                <span className="text-lg md:text-xl font-black text-gray-900">₹{product.price}</span>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <User size={14} className="text-indigo-600" />
                                Personal Identity
                            </h4>
                            <div className="space-y-3">
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input 
                                        type="text" placeholder="Full Name" 
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                                        value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input 
                                        type="email" placeholder="Email Address" 
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                                        value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="relative group">
                                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                                    <input 
                                        type="tel" placeholder="Mobile Number" 
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium"
                                        value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            disabled={!formData.name || !formData.email || !formData.phone}
                            onClick={handleNext} 
                            className="w-full py-4 md:py-5 bg-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                        >
                            Continue to Delivery
                            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6 md:space-y-8">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin size={14} className="text-indigo-600" />
                                Delivery Requirements
                            </h4>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-tighter">Step 02</span>
                        </div>

                        <div className="space-y-5">
                            {/* Generic Field Rendering based on product.fields */}
                            {product.fields?.includes('address') && (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <textarea 
                                            placeholder="Complete Shipping Address (House No, Street, Landmark...)" 
                                            className="w-full p-4 md:p-5 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl h-32 focus:border-indigo-500 focus:bg-white outline-none transition-all placeholder:text-gray-400 font-medium resize-none"
                                            value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <input type="text" placeholder="City" className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                        <input type="text" placeholder="Pincode" className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                                    </div>
                                </div>
                            )}

                            {product.fields?.includes('slot') && (
                               <div className="space-y-4">
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={18} />
                                        <select 
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium appearance-none cursor-pointer" 
                                            value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value})}
                                        >
                                            <option value="">Select a Time Slot</option>
                                            <option value="mon_10am">Monday 10:00 AM</option>
                                            <option value="wed_2pm">Wednesday 02:00 PM</option>
                                            <option value="fri_4pm">Friday 04:00 PM</option>
                                        </select>
                                        <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" />
                                    </div>
                                    <input 
                                        type="text" placeholder="Primary Topic for Discussion" 
                                        className="w-full p-4 bg-gray-50/50 border-2 border-gray-100 rounded-xl md:rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium" 
                                        value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} 
                                    />
                               </div>
                            )}

                            {product.fields?.includes('batch') && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Target Batch</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        {BATCHES.map(b => (
                                            <button 
                                                key={b}
                                                onClick={() => setFormData({...formData, batch: b})}
                                                className={`py-3 md:py-4 px-2 rounded-xl md:rounded-2xl border-2 transition-all font-black text-sm md:text-base ${formData.batch === b ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'border-gray-100 bg-gray-50/50 text-gray-400 hover:border-indigo-200 hover:text-indigo-400'}`}
                                            >
                                                {b}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Digital Delivery Info for book_online or similar */}
                            {product.mode === 'online' && product.type === 'book' && (
                                <div className="bg-indigo-50 border-2 border-indigo-100 rounded-3xl p-6 space-y-4">
                                    <div className="flex items-center gap-3 text-indigo-600">
                                        <ShieldCheck size={24} />
                                        <h5 className="font-black uppercase tracking-widest text-sm">Digital Delivery Terms</h5>
                                    </div>
                                    <ul className="space-y-2">
                                        <li className="flex items-start gap-2 text-xs text-indigo-700 font-medium">
                                            <Check size={14} className="mt-0.5 shrink-0" />
                                            Instant access via Dashboard after successful payment.
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-indigo-700 font-medium">
                                            <Check size={14} className="mt-0.5 shrink-0" />
                                            The book will be available in a secure online reader.
                                        </li>
                                        <li className="flex items-start gap-2 text-xs text-red-600 font-bold">
                                            <XCircle size={14} className="mt-0.5 shrink-0" />
                                            PDF is NOT downloadable and NOT shareable.
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-4">
                            <button onClick={handleNext} className="order-1 md:order-2 flex-[2] py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                                Review & Checkout
                                <ChevronRight size={20} />
                            </button>
                            <button onClick={handleBack} className="order-2 md:order-1 flex-1 py-4 border-2 border-gray-100 rounded-xl md:rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                                <ArrowLeft size={16} />
                                Back
                            </button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 md:space-y-8">
                        <div className="bg-gray-50/50 rounded-3xl p-5 md:p-8 border border-gray-100">
                             <div className="space-y-4">
                                 <div className="flex justify-between items-center bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm">
                                     <div className="flex items-center gap-3 md:gap-4">
                                        <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-100 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center font-bold">
                                            <ShoppingBag size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] md:text-sm font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Product</p>
                                            <p className="font-bold text-gray-900 leading-none text-sm md:text-base">{product.title}</p>
                                        </div>
                                     </div>
                                     <span className="text-base md:text-xl font-black text-gray-900">₹{product.price}</span>
                                 </div>

                                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                                     <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                         <MapPin size={18} className="text-indigo-600 shrink-0" />
                                         <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Mode</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-900 leading-none capitalize truncate">{product.mode || 'Online'}</p>
                                         </div>
                                     </div>
                                     <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                                         <Calendar size={18} className="text-indigo-600 shrink-0" />
                                         <div className="min-w-0">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Details</p>
                                            <p className="text-xs md:text-sm font-bold text-gray-900 leading-none truncate">{formData.city || formData.batch || formData.slot || 'Standard'}</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
                                 <div className="flex justify-between items-center">
                                     <span className="font-bold text-gray-600">Total Amount</span>
                                     <span className="text-xl md:text-2xl font-black text-indigo-600">₹{product.price}</span>
                                 </div>
                             </div>
                        </div>

                        {paymentStatus === 'processing' ? (
                            <div className="text-center py-6 md:py-8 space-y-4 bg-indigo-50/50 rounded-2xl md:rounded-3xl border border-indigo-100 border-dashed">
                                <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-indigo-600 mx-auto" />
                                <div>
                                    <p className="font-black text-indigo-900 uppercase tracking-widest text-[10px] md:text-xs">Waiting for Payment</p>
                                    <p className="text-indigo-700 text-xs md:text-sm mt-1 px-4 text-center mx-auto max-w-[280px]">The secure Razorpay window is open. Please do not close this page.</p>
                                </div>
                            </div>
                        ) : paymentStatus === 'success' ? (
                            <div className="text-center py-8 space-y-4 bg-green-50 rounded-3xl border border-green-100">
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 md:w-16 md:h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100">
                                    <ShieldCheck size={32} />
                                </motion.div>
                                <h3 className="text-2xl font-black text-green-900">Securely Paid!</h3>
                                <p className="text-green-700 font-medium text-sm">Order ID: {order?.id?.slice(0, 8).toUpperCase()}</p>
                            </div>
                        ) : paymentStatus === 'failed' ? (
                            <div className="text-center py-8 space-y-4 bg-red-50 rounded-3xl border border-red-100">
                                <XCircle className="w-14 h-14 md:w-16 md:h-16 text-red-500 mx-auto" />
                                <h3 className="text-2xl font-black text-red-900 text-xl md:text-2xl">Payment Failed</h3>
                                <p className="text-red-700 font-medium text-sm">{paymentError || 'Please try again.'}</p>
                                <button onClick={() => setPaymentStatus('idle')} className="text-red-600 font-bold underline text-sm">Try Again</button>
                            </div>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                <button onClick={handlePayment} className="order-1 md:order-2 flex-[2] py-4 md:py-5 bg-indigo-600 text-white rounded-xl md:rounded-2xl font-black text-base md:text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group">
                                    Securely Pay ₹{product.price}
                                    <ShieldCheck className="group-hover:scale-110 transition-transform" />
                                </button>
                                <button onClick={handleBack} className="order-2 md:order-1 flex-1 py-4 border-2 border-gray-100 rounded-xl md:rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm md:text-base">
                                    <ArrowLeft size={16} />
                                    Back
                                </button>
                            </div>
                        )}
                        
                        <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 md:mt-4 opacity-75">
                             <ShieldCheck size={12} />
                             Powered by Razorpay • Encrypted
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-12 px-4 md:py-20 selection:bg-indigo-100">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
                    
                    {/* Left Side: Order Progress & Info */}
                    <div className="md:col-span-2 space-y-8 md:space-y-12">
                        <div className="flex md:block items-center justify-between border-b md:border-none pb-4 md:pb-0 border-gray-100">
                            <div className="space-y-2 md:space-y-4">
                                <button 
                                    onClick={() => navigate(-1)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors font-bold text-[10px] md:text-xs uppercase tracking-widest"
                                >
                                    <ArrowLeft size={14} />
                                    Back
                                </button>
                                <h1 className="text-3xl md:text-6xl font-black text-gray-900 tracking-tighter leading-none">
                                    Finish <span className="text-indigo-600 md:block">Strong.</span>
                                </h1>
                            </div>
                        </div>

                        {/* Progress Stepper */}
                        <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-4 md:space-y-8 relative px-4 md:px-0">
                            {/* Line Connector */}
                            <div className="absolute left-10 right-10 top-6 md:top-4 md:bottom-4 md:left-[23px] md:w-0.5 h-0.5 md:h-auto bg-gray-100 z-0" />
                            
                            {[
                                { n: 1, label: 'Service', icon: <ShoppingBag size={20} /> },
                                { n: 2, label: 'Delivery', icon: <MapPin size={20} /> },
                                { n: 3, label: 'Checkout', icon: <CreditCard size={20} /> }
                            ].map((s) => (
                                <div key={s.n} className="flex flex-col md:flex-row items-center gap-2 md:gap-6 group relative z-10">
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-[15px] md:rounded-[20px] flex items-center justify-center transition-all duration-500 font-bold border-2 ${step >= s.n ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100 rotate-12 scale-110' : 'bg-white border-gray-100 text-gray-300'}`}>
                                        {step > s.n ? <Check size={20} /> : s.icon}
                                    </div>
                                    <div className="hidden md:block transition-all duration-500">
                                        <p className={`text-[10px] font-black uppercase tracking-widest ${step >= s.n ? 'text-indigo-600' : 'text-gray-300'}`}>Step 0{s.n}</p>
                                        <p className={`text-xl font-black ${step >= s.n ? 'text-gray-900' : 'text-gray-300'}`}>{s.label}</p>
                                    </div>
                                    {/* Mobile Label */}
                                    <span className={`md:hidden text-[10px] font-bold uppercase tracking-tight ${step >= s.n ? 'text-indigo-600' : 'text-gray-400'}`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Secure Note - Hidden on Mobile to save space */}
                        <div className="hidden md:flex p-8 bg-white rounded-[32px] border border-gray-100 shadow-sm gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full opacity-50 -mr-8 -mt-8 transition-all group-hover:scale-110" />
                            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10">
                                <ShieldCheck size={28} />
                            </div>
                            <div className="relative z-10">
                                <span className="font-black text-gray-900 truncate uppercase tracking-widest text-xs block mb-2">Verified Merchant</span>
                                <p className="text-sm text-gray-500 leading-snug">
                                    Your data is encrypted with 256-bit SSL. Safe and secure checkout.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Form Content */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={step}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                className="bg-white p-6 md:p-14 rounded-3xl md:rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50"
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            <AuthModal 
                isOpen={showAuth} 
                onClose={() => setShowAuth(false)} 
                onSuccess={() => {
                    setShowAuth(false);
                    checkUser();
                }}
            />
        </Layout>
    );
};

export default OrderPage;
