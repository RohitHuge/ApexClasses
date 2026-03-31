import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { BATCHES } from './orderTypes';
import { useProducts } from '../context/ProductContext';
import { orderService } from './orderService';
import { getCurrentUser } from '../utils/appwrite';
import AuthModal from './components/AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ShoppingBag, MapPin, Calendar, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';

const OrderPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { products, loading: productsLoading } = useProducts();
    
    // State
    const productId = searchParams.get('productId') || searchParams.get('type') || 'book';
    const product = products[productId] || products['book'];
    
    const [type, setType] = useState(product?.type || 'book');
    const [mode, setMode] = useState(product?.mode || 'online');
    const [step, setStep] = useState(1);
    const [user, setUser] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState(null);
    
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
        if (!product) {
            navigate('/order?type=book');
        }
    }, [type, product, navigate]);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        const u = await getCurrentUser();
        setUser(u);
    };

    const handleNext = () => {
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinalStep = async () => {
        if (!user) {
            setShowAuth(true);
            return;
        }
        
        setLoading(true);
        try {
            // 1. Create Order (Price is looked up on backend via productId)
            const res = await orderService.createOrder({
                user_id: user.$id,
                productId: productId,
                metadata: formData
            });

            if (res.success) {
                setOrder(res.order);
                setStep(4); // Move to payment step
                // 2. Create Payment
                const payRes = await orderService.createPayment(res.order.id, user.$id);
                if (payRes.success) {
                    // Simulate Payment Gateway Redirect
                    setTimeout(async () => {
                        // 3. Verify Payment (Mock)
                        const verifyRes = await orderService.verifyPayment({
                            order_id: res.order.id,
                            payment_id: 'pay_mock_123',
                            payment_order_id: payRes.payment_order.id,
                            payment_signature: 'sig_mock_123'
                        }, user.$id);

                        if (verifyRes.success) {
                            navigate(`/orders?success=true&orderId=${res.order.id}`);
                        }
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Order Flow Error:', error);
        } finally {
            // setLoading(false); // Keep loading during simulated payment
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
                    <div className="space-y-6">
                        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                            <h3 className="text-xl font-bold text-indigo-900">{product.title}</h3>
                            <p className="text-indigo-700 mt-1">{product.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-sm font-medium text-indigo-600 uppercase tracking-wider">{mode} mode</span>
                                <span className="text-2xl font-black text-indigo-900">₹{product.price}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900">Personal Information</h4>
                            <input 
                                type="text" placeholder="Full Name" 
                                className="w-full p-4 border rounded-xl"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <input 
                                type="email" placeholder="Email Address" 
                                className="w-full p-4 border rounded-xl"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <button onClick={handleNext} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                            Continue
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-gray-900">Requirement Details</h4>
                        {type === 'book' && (
                            <div className="space-y-4">
                                <textarea 
                                    placeholder="Complete Shipping Address" 
                                    className="w-full p-4 border rounded-xl h-32"
                                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="City" className="p-4 border rounded-xl" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                                    <input type="text" placeholder="Pincode" className="p-4 border rounded-xl" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                                </div>
                            </div>
                        )}
                        {type === 'counselling' && (
                           <div className="space-y-4">
                                <select className="w-full p-4 border rounded-xl" value={formData.slot} onChange={e => setFormData({...formData, slot: e.target.value})}>
                                    <option value="">Select a Slot</option>
                                    <option value="mon_10am">Monday 10:00 AM</option>
                                    <option value="wed_2pm">Wednesday 02:00 PM</option>
                                    <option value="fri_4pm">Friday 04:00 PM</option>
                                </select>
                                <input type="text" placeholder="Primary Topic for Discussion" className="p-4 border rounded-xl w-full" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                           </div>
                        )}
                        {type === 'jlpt' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-gray-700">Select Batch</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {BATCHES.map(b => (
                                        <button 
                                            key={b}
                                            onClick={() => setFormData({...formData, batch: b})}
                                            className={`py-3 px-4 rounded-xl border-2 transition-all font-bold ${formData.batch === b ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-100 hover:border-indigo-200'}`}
                                        >
                                            {b}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-4">
                            <button onClick={handleBack} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">Back</button>
                            <button onClick={handleNext} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">Continue</button>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                           <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                               <Check size={32} />
                           </div>
                           <h3 className="text-2xl font-bold text-gray-900">Review Your Order</h3>
                           <p className="text-gray-500">Almost there! Please verify the details below.</p>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100">
                             <div className="flex justify-between border-b pb-3 border-gray-200">
                                 <span className="text-gray-500">Item</span>
                                 <span className="font-bold">{product.title}</span>
                             </div>
                             <div className="flex justify-between border-b pb-3 border-gray-200">
                                 <span className="text-gray-500">Recipient</span>
                                 <span className="font-bold">{formData.name}</span>
                             </div>
                             <div className="flex justify-between">
                                 <span className="text-gray-500">Total Amount</span>
                                 <span className="text-xl font-black text-indigo-600">₹{product.price}</span>
                             </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={handleBack} className="flex-1 py-4 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">Back</button>
                            <button onClick={handleFinalStep} className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                                {loading ? <Loader2 className="animate-spin" /> : 'Pay Now'}
                                {!loading && <ChevronRight size={20} />}
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="text-center py-12 space-y-6">
                        <div className="inline-block p-4 bg-indigo-50 rounded-2xl">
                             <CreditCard className="text-indigo-600 animate-bounce" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-900">Redirecting to Payment...</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">Please do not refresh the page or click back button while we process your request.</p>
                        </div>
                        <div className="flex justify-center gap-2">
                             <div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse" />
                             <div className="w-3 h-3 bg-indigo-600/60 rounded-full animate-pulse delay-75" />
                             <div className="w-3 h-3 bg-indigo-600/30 rounded-full animate-pulse delay-150" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 py-12 px-4 md:py-20">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
                    
                    {/* Left Side: Order Progress & Info */}
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <button 
                                onClick={() => navigate(-1)}
                                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold text-sm mb-6 uppercase tracking-widest"
                            >
                                <ArrowLeft size={16} />
                                Back to Product
                            </button>
                            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                                Complete Your <span className="text-indigo-600 block">Order</span>
                            </h1>
                        </div>

                        {/* Progress Stepper */}
                        <div className="space-y-6">
                            {[
                                { n: 1, label: 'Service Selection', icon: <ShoppingBag size={18} /> },
                                { n: 2, label: 'Delivery Details', icon: <MapPin size={18} /> },
                                { n: 3, label: 'Review & Pay', icon: <CreditCard size={18} /> }
                            ].map((s) => (
                                <div key={s.n} className="flex items-center gap-4 group">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 font-bold ${step >= s.n ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-gray-400 border-2 border-gray-100'}`}>
                                        {step > s.n ? <Check size={20} /> : s.icon}
                                    </div>
                                    <div>
                                        <p className={`text-xs font-black uppercase tracking-widest ${step >= s.n ? 'text-indigo-600' : 'text-gray-400'}`}>Step 0{s.n}</p>
                                        <p className={`font-bold ${step >= s.n ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Secure Note */}
                        <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <Check size={20} />
                            </div>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                <span className="font-bold text-gray-900 block mb-1">Encrypted Checkout</span>
                                Your transaction is protected with 256-bit SSL encryption. We never store your card details.
                            </p>
                        </div>
                    </div>

                    {/* Right Side: Form Content */}
                    <div className="md:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={step}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-2xl shadow-indigo-50/50"
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
                    checkUser();
                    handleFinalStep();
                }}
            />
        </Layout>
    );
};

export default OrderPage;
