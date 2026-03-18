import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

export default function CounsellingBook() {
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
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfeKO3RL2o-n8lVfhGS7vLY_qVPVrYa1PqbhREqAm2zeGNdL5_hi0Rgx42v99PB9zOXaKmuZ48qh18KId3J74-1lLluqIJVGZ1HhJ_o1iDllW-MhyE0pDty5aPfI-onJtT7Mo8k4RK8Cc8b0p0lXvzWa0k6XRK1gTlruDMA1kgcMJ36YbbDs1nU8ShxlD84GOQjAVPPbYvO_-nZTwvniFBUMkssHQG9v0o_zYY2Sq6GMc2HqhFf-9AZPRrXW7C0zbNGwohxYXpNA"
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
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-[#1A1A40]">₹499</div>
                    <div className="text-lg text-slate-400 line-through">₹999</div>
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">50% OFF</div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button className="flex-1 sm:flex-none h-14 px-8 bg-[#FF6600] hover:bg-orange-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#FF6600]/30 whitespace-nowrap">
                      <span className="material-symbols-outlined">shopping_cart</span>
                      Buy Now
                    </button>
                    <button className="flex-1 sm:flex-none h-14 px-8 bg-white border-2 border-green-500 text-green-600 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-50 transition-all whitespace-nowrap">
                      <span className="material-symbols-outlined">chat</span>
                      Order on WhatsApp
                    </button>
                    <Link to="/book/index" className="flex-1 sm:flex-none">
                      <button className="w-full h-14 px-8 bg-[#1A1A40] hover:bg-slate-900 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-[#1A1A40]/20 whitespace-nowrap">
                        <span className="material-symbols-outlined">menu_book</span>
                        View Detailed Index
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <a className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl transition-all group flex flex-col items-center" href="#">
                  <span className="material-symbols-outlined text-5xl text-white mb-4">chat</span>
                  <span className="text-xl font-bold text-white">WhatsApp</span>
                  <p className="text-white/80 mt-2">Get instant replies</p>
                </a>
                <a className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl transition-all group flex flex-col items-center" href="#">
                  <span className="material-symbols-outlined text-5xl text-white mb-4">call</span>
                  <span className="text-xl font-bold text-white">Call Us</span>
                  <p className="text-white/80 mt-2">+91 98765 43210</p>
                </a>
                <a className="bg-white/10 hover:bg-white/20 p-8 rounded-2xl transition-all group flex flex-col items-center" href="#">
                  <span className="material-symbols-outlined text-5xl text-white mb-4">mail</span>
                  <span className="text-xl font-bold text-white">Email</span>
                  <p className="text-white/80 mt-2">support@apexcounsel.com</p>
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
