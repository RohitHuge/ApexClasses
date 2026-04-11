import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { getCurrentUser } from '../utils/appwrite';
import { orderService } from '../order/orderService';
import AuthModal from '../order/components/AuthModal';
import { motion } from 'framer-motion';

export default function CounsellingBook() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [user, setUser] = useState(null);
  const [hasBoughtOnline, setHasBoughtOnline] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const u = await getCurrentUser();
    if (u) {
      setUser(u);
      try {
        const res = await orderService.getOrderHistory(u.$id);
        if (res.success) {
          const onlineBookOrder = res.orders.find(o => 
            o.product_type === 'book' && o.mode === 'online' && o.status === 'SUCCESS'
          );
          if (onlineBookOrder) {
            setHasBoughtOnline(true);
            setOrderDetails(onlineBookOrder);
          }
        }
      } catch (err) {
        console.error('Error checking order status:', err);
      }
    }
  };

  const handleOrder = (productId) => {
    navigate(`/order?productId=${productId}`);
  };

  const getPrice = (id) => products[id]?.price || '...';

  return (
    <Layout>
      <div className="bg-slate-50 font-display text-slate-900">
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
          {/* Hero Section */}
          <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left: Book Mockup */}
                <div className="order-2 lg:order-1 flex justify-center lg:justify-start">
                  <div className="relative w-full max-w-md group">
                    <div className="absolute -inset-4 bg-[#FF6600]/10 rounded-xl blur-2xl group-hover:bg-[#FF6600]/20 transition-all"></div>
                    <img 
                      className="relative w-full h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-500" 
                      alt="3D book mockup titled MHT-CET Engineering Admission Counselling Guide 2026" 
                      src="https://ik.imagekit.io/apexcounselling/Gemini_Generated_Image_e4o9y0e4o9y0e4o9.png"
                    />
                  </div>
                </div>
                {/* Right: Content */}
                <div className="order-1 lg:order-2 space-y-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF6600]/10 border border-[#FF6600]/20 text-[#FF6600] text-xs font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6600] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6600]"></span>
                    </span>
                    New for 2026 Aspirants
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-black text-[#1A1A40] leading-[1.1]">
                    Master Your MHT-CET Admission with Our <span className="text-[#FF6600]">Expert Guide</span>
                  </h1>
                  <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                    This book helps students understand the engineering admission process, college selection, branch selection, TFWS planning, and cutoff analysis for Maharashtra colleges. Secure your seat in a top-tier college with the right preference list.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Online Edition */}
                    <div className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden ${hasBoughtOnline ? 'border-green-100' : 'border-indigo-100'}`}>
                      <div className="absolute top-0 right-0 p-3">
                        <span className={`material-symbols-outlined transition-colors ${hasBoughtOnline ? 'text-green-200 group-hover:text-green-500' : 'text-indigo-200 group-hover:text-indigo-500'}`}>
                           {hasBoughtOnline ? 'auto_stories' : 'cloud_download'}
                        </span>
                      </div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2">Digital Edition</h3>
                      <p className="text-slate-500 text-sm mb-4">
                         {hasBoughtOnline ? 'You have active access to this digital edition.' : 'Secure Online PDF Reader access. Instant delivery.'}
                      </p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className={`text-2xl font-black ${hasBoughtOnline ? 'text-green-600' : 'text-[#1A1A40]'}`}>
                           {hasBoughtOnline ? 'Unlocked' : `₹${getPrice('book_online')}`}
                        </span>
                        {!hasBoughtOnline && <span className="text-sm text-slate-400 line-through">₹499</span>}
                      </div>

                      {hasBoughtOnline ? (
                         <button 
                            onClick={() => navigate(`/view-book/${orderDetails.id}`)}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                         >
                            <span className="material-symbols-outlined text-base">menu_book</span>
                            Read Digital Edition
                         </button>
                      ) : (
                         <button 
                            onClick={() => handleOrder('book_online')}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100"
                         >
                            Order Online PDF
                         </button>
                      )}
                      <p className="text-[10px] text-slate-400 mt-3 text-center italic">
                        {hasBoughtOnline ? 'Active on your account' : '*Non-downloadable & Non-shareable'}
                      </p>
                    </div>

                    {/* Offline Edition */}
                    <div className="bg-white border-2 border-[#FF6600]/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3">
                        <span className="material-symbols-outlined text-[#FF6600]/20 group-hover:text-[#FF6600] transition-colors">local_shipping</span>
                      </div>
                      <h3 className="font-bold text-xl text-slate-800 mb-2">Physical Edition</h3>
                      <p className="text-slate-500 text-sm mb-4">Premium Quality Hardcopy with doorstep delivery.</p>
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-2xl font-black text-[#1A1A40]">₹{getPrice('book_offline')}</span>
                        <span className="text-sm text-slate-400 line-through">₹999</span>
                      </div>
                      <button 
                        onClick={() => handleOrder('book_offline')}
                        className="w-full py-3 bg-[#FF6600] hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-[#FF6600]/20"
                      >
                        Order Hardcopy
                      </button>
                      <p className="text-[10px] text-slate-400 mt-3 text-center italic">*Delivery within 5-7 working days</p>
                    </div>
                  </div>

                  {/* Returning User Flow */}
                  {!user && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="pt-4"
                    >
                        <button 
                            onClick={() => setShowAuthModal(true)}
                            className="w-full md:w-auto px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-50 border-dashed rounded-xl font-black text-xs uppercase tracking-widest hover:border-indigo-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">login</span>
                            Bought already? Read here...
                        </button>
                    </motion.div>
                  )}

                  <div className="pt-6">
                    <Link to="/book/index">
                      <button className="w-full md:w-auto px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-200">
                        <span className="material-symbols-outlined">menu_book</span>
                        View Detailed Book Index
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Key Features / What's Inside */}
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A40] mb-4">What's Inside the Guide?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg">Comprehensive insights designed to give you a competitive edge in the Maharashtra engineering admission landscape.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature 1 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/50 transition-all group">
                  <div className="w-14 h-14 bg-[#1A1A40] text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">list_alt</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A40] mb-3">Step-by-step CAP Process</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Navigate the Centralized Admission Process with ease and zero errors from registration to seat acceptance.</p>
                </div>
                {/* Feature 2 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/50 transition-all group">
                  <div className="w-14 h-14 bg-[#1A1A40] text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">insights</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A40] mb-3">Branch vs College Analysis</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Expert guidance on prioritizing the right engineering branch over college prestige for better career prospects.</p>
                </div>
                {/* Feature 3 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/50 transition-all group">
                  <div className="w-14 h-14 bg-[#1A1A40] text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">savings</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A40] mb-3">TFWS Savings Secret</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Learn how to save lakhs in fees through the Tuition Fee Waiver Scheme with strategic application planning.</p>
                </div>
                {/* Feature 4 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-[#FF6600]/50 transition-all group">
                  <div className="w-14 h-14 bg-[#1A1A40] text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">data_exploration</span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1A40] mb-3">5-Year Cutoff Data</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">Comprehensive historical data for all top Maharashtra engineering colleges to predict your chances accurately.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-24 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                <div className="flex-1">
                  <img className="rounded-2xl shadow-xl" alt="Happy students discussing university admission process" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCVjklZWLlN8BiUc_FcbGL5nOAahKmR1KcnotPoh5bbxLzzllmDVHPWR6alVhVpmuthCNYC3Q6a8B0MekHX6_CITferf7n9ZRuh_6oc5j-vY4WSxFwORMM064IfNlHEZ1Zt2vxY0duqyiytzTos9f05dkgBpRKoSiPcYN9D0QDG8smna5PV7FJMWSfR2RVSe8dD3mWWhb_6xToEnHAN7oDh6Zp0DAbYHjp72_iSteqbGsBT9dGW_T9mjmmhw42Jh1NWTXi3CbogQ" />
                </div>
                <div className="flex-1 space-y-6">
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1A40]">Why This Book is Essential for MHT-CET 2026</h2>
                  <p className="text-lg text-slate-600">The admission process is becoming more complex every year. Our guide provides the clarity you need to avoid common pitfalls that could cost you your dream college seat.</p>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#FF6600] mt-1">check_circle</span>
                      <span className="text-slate-700 font-medium">Updated content for the latest 2026 reservation rules and seat matrix.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#FF6600] mt-1">check_circle</span>
                      <span className="text-slate-700 font-medium">Expert strategies used by top counsellors for preference form filling.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#FF6600] mt-1">check_circle</span>
                      <span className="text-slate-700 font-medium">Includes a bonus checklist for all required admission documents.</span>
                    </li>
                  </ul>
                  <Link to="/services">
                    <button className="bg-[#1A1A40] text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-900 transition-colors mt-6">
                      Learn More About Our Services
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Enquiry Section */}
          <section className="py-20 bg-[#FF6600]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-12">Still Have Questions? Connect with Us</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <a 
                  className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl transition-all group flex flex-col items-center" 
                  href="https://wa.me/919860821154?text=Hi%20Apex%20Classes,%20I'd%20like%20to%20enquire%20about%20the%20MHT-CET%20Admission%20Counselling%20Guide%202026."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="material-symbols-outlined text-5xl text-white mb-4">chat</span>
                  <span className="text-xl font-bold text-white">WhatsApp</span>
                  <p className="text-white/80 mt-2">Get instant replies</p>
                </a>
                <a 
                  className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl transition-all group flex flex-col items-center" 
                  href="tel:9975941794"
                >
                  <span className="material-symbols-outlined text-5xl text-white mb-4">call</span>
                  <span className="text-xl font-bold text-white">Call Us</span>
                  <p className="text-white/80 mt-2">9975941794</p>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // Redirect to dashboard as requested
          navigate('/dashboard');
        }}
      />
    </Layout>
  );
}
