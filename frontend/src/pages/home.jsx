import React from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import CountUp from '../components/CountUp';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  const navigate = useNavigate();
  const { products } = useProducts();

  const handleOrder = (productId) => {
    navigate(`/order?productId=${productId}`);
  };

  const getPrice = (id) => products[id]?.price || '...';

  return (
    <Layout>
      {/* BEGIN: Hero Section */}
      <section className="relative overflow-hidden hero-gradient pt-8 pb-24 lg:pt-12 lg:pb-40 bg-white">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16"
        >
          {/* Left Column: Content */}
          <motion.div variants={fadeIn} className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-apexBlue text-sm font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-apexBlue animate-ping"></span>
              Maharashtra's Premier Admission Consultants
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold text-apexBlue leading-tight mb-6">
              Expert Guidance for <span className="text-apexOrange">MHT-CET</span> Engineering & Pharmacy Admissions
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-2xl">
              Strategic cutoff analysis, personalized preference list planning, and expert guidance to help you secure a seat in Maharashtra's top colleges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOrder('counselling_offline')}
                className="bg-orange-gradient text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-apexOrange/20"
              >
                Book Appointment
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/book')}
                className="bg-white text-apexBlue border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-apexBlue transition-all"
              >
                Buy Counselling Book
              </motion.button>
            </div>
            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-extrabold text-apexBlue">
                  <CountUp to={18} suffix="+" />
                </p>
                <p className="text-sm text-slate-500 font-medium">Years Experience</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-apexBlue">
                  <CountUp to={450} suffix="+" />
                </p>
                <p className="text-sm text-slate-500 font-medium">Colleges Listed</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-apexBlue">
                  <CountUp to={100} suffix="%" />
                </p>
                <p className="text-sm text-slate-500 font-medium">Admission Success</p>
              </div>
            </div>
          </motion.div>
          {/* Right Column: Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-tr from-apexBlue/10 to-transparent rounded-full blur-3xl -z-10"></div>
            <motion.img
              whileHover={{ rotate: -1, scale: 1.02 }}
              alt="Educational Illustration"
              className="w-full h-auto rounded-3xl shadow-2xl"
              src="https://ik.imagekit.io/apexcounselling/Gemini_Generated_Image_r4o6xrr4o6xrr4o6.png"
            />
          </motion.div>
        </motion.div>
      </section>
      {/* END: Hero Section */}

      {/* BEGIN: Why You Need a Counsellor */}
      <section className="py-24 bg-apexLight" id="why">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-apexBlue mb-4">Why You Need Expert Counselling?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Navigating the admission process is complex. We simplify it to ensure you make the best career choices.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              className="p-8 rounded-2xl bg-white border border-slate-100 transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 shadow-sm group-hover:bg-apexBlue group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-apexBlue group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-apexBlue">Preference Form Complexity</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Avoid errors in option filling that could lead to losing a seat in a dream college despite good marks.</p>
            </motion.div>
            {/* Card 2 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              className="p-8 rounded-2xl bg-white border border-slate-100 transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 shadow-sm group-hover:bg-apexBlue group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-apexBlue group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-apexBlue">TFWS & Fee Saving</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Strategic planning for Tuition Fee Waiver Scheme (TFWS) to save lakhs in fees throughout your degree.</p>
            </motion.div>
            {/* Card 3 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              className="p-8 rounded-2xl bg-white border border-slate-100 transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 shadow-sm group-hover:bg-apexBlue group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-apexBlue group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-apexBlue">Large Selection Pool</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Selecting from 300+ engineering colleges in Maharashtra is overwhelming without data-backed analysis.</p>
            </motion.div>
            {/* Card 4 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
              className="p-8 rounded-2xl bg-white border border-slate-100 transition-all group cursor-default"
            >
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-6 shadow-sm group-hover:bg-apexBlue group-hover:text-white transition-colors">
                <svg className="w-6 h-6 text-apexBlue group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-apexBlue">Experienced Team</h3>
              <p className="text-slate-600 text-sm leading-relaxed">Benefit from years of experience in counseling thousands of students with similar percentile ranges.</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* END: Why You Need a Counsellor */}

      {/* BEGIN: Counselling Services Preview */}
      <section className="py-24 bg-apexBlue text-white relative overflow-hidden" id="services">
        <div className="absolute top-0 right-0 w-96 h-96 bg-apexOrange/10 blur-[100px] -z-0"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/40 blur-[100px] -z-0"></div>
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold mb-4">Our Service Packages</h2>
            <p className="text-blue-200">Choose a plan that fits your admission journey</p>
          </motion.div>
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
            {/* Basic Offline */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col transition-colors backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-2">Offline One-on-One</h3>
              <div className="text-4xl font-extrabold mb-6">₹{getPrice('counselling_offline')} <span className="text-sm font-normal text-blue-200">/ Session</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Physical Presence Required
                </li>
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Individual Cutoff Analysis
                </li>
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized Consultation
                </li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOrder('counselling_offline')}
                className="w-full py-3 rounded-xl border-2 border-white/20 font-bold hover:bg-white/10 transition-colors"
              >
                Select Plan
              </motion.button>
            </motion.div>
            {/* Featured: Complete Guidance */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.05 }}
              className="p-8 rounded-3xl bg-white text-apexBlue flex flex-col shadow-2xl relative z-20"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-gradient text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Recommended</div>
              <h3 className="text-xl font-bold mb-2">Complete Guidance</h3>
              <div className="text-4xl font-extrabold mb-6 text-apexBlue">₹{getPrice('counselling_complete')} <span className="text-sm font-normal text-slate-500">/ Full Process</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-apexOrange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  End-to-End Registration Support
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-apexOrange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CAP Round Option Form Planning
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-apexOrange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Spot Round & Institutional Support
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-600">
                  <svg className="w-5 h-5 text-apexOrange" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  24/7 Dedicated Support Head
                </li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOrder('counselling_complete')}
                className="w-full py-4 rounded-xl bg-orange-gradient text-white font-bold text-lg hover:brightness-110 shadow-xl shadow-apexOrange/30 transition-all"
              >
                Book Premium Guidance
              </motion.button>
            </motion.div>
            {/* FESS Online */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col transition-colors backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-2">FESS Online</h3>
              <div className="text-4xl font-extrabold mb-6">₹{getPrice('counselling_online')} <span className="text-sm font-normal text-blue-200">/ Package</span></div>
              <ul className="space-y-4 mb-8 flex-grow">
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Online Live Sessions
                </li>
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Digital Preference Forms
                </li>
                <li className="flex items-center gap-2 text-sm text-blue-50">
                  <svg className="w-5 h-5 text-apexOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Recorded Video Guides
                </li>
              </ul>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleOrder('counselling_online')}
                className="w-full py-3 rounded-xl border-2 border-white/20 font-bold hover:bg-white/10 transition-colors"
              >
                Select Plan
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* END: Counselling Services Preview */}

      {/* BEGIN: Counselling Book Promotion */}
      <section className="py-24 bg-white overflow-hidden">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16 bg-slate-50 rounded-[3rem] p-8 lg:p-16 border border-slate-100 shadow-sm">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 flex justify-center"
            >
              {/* 3D Book Mockup */}
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-4 bg-apexBlue/5 rounded-3xl blur-xl group-hover:bg-apexBlue/10 transition-colors"></div>
                <motion.img
                  whileHover={{ rotate: -3, scale: 1.05 }}
                  alt="Counselling Book 2026"
                  className="relative rounded-lg shadow-2xl transition-transform duration-500"
                  src="https://ik.imagekit.io/apexcounselling/homepage.png"
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="text-apexOrange font-bold tracking-widest uppercase text-sm">Best Seller 2026</span>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-apexBlue mt-4 mb-6">MHT-CET Engineering Admission Counselling Guide 2026</h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Everything you need to know about the CAP process, branch selection, and top colleges in one comprehensive book. Used by 10,000+ students every year.
              </p>
              <div className="flex flex-wrap gap-4">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOrder('book')}
                  className="bg-orange-gradient text-white px-10 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-apexOrange/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Buy Now
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-emerald-500 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.438 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
      {/* END: Counselling Book Promotion */}

      {/* BEGIN: Proven Track Record */}
      <section className="py-24 bg-white" id="track-record">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <motion.h2 variants={fadeIn} className="text-3xl lg:text-4xl font-extrabold text-apexBlue mb-16">Proven Track Record</motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              'COEP Pune', 'VJTI Mumbai', 'PICT Pune', 'SPIT Mumbai',
              'VIT Pune', 'WCE Sangli', 'PCCOE Pune', 'DJ Sanghvi'
            ].map((college) => (
              <motion.div 
                key={college} 
                variants={fadeIn}
                whileHover={{ scale: 1.1, backgroundColor: "#fff", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                className="bg-blue-50 border border-blue-100 p-8 rounded-2xl flex items-center justify-center transition-all group cursor-default"
              >
                <span className="text-2xl lg:text-3xl font-black text-apexBlue group-hover:text-apexOrange transition-colors">{college}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>
      {/* END: Proven Track Record */}

      {/* BEGIN: Student Video Feedback */}
      <section className="py-24 bg-apexLight" id="feedback">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-apexBlue mb-4">Success Stories</h2>
            <p className="text-slate-500">Hear from students who achieved their dreams with Apex</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 transition-all group"
            >
              <div className="relative h-48 bg-slate-200">
                <img
                  alt="Testimonial Thumbnail"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfRzafLnVEu5xAshy-kPFBjSyoFXF6mTuOzbcwGKZnh5POl5HW5r7RBrCq__yerRt_1ubWtqaVKrcHWX22L7slm-IRIq8lTYguiDHX_bjb0ddUnGXnnyC5prCHUWS9OTrv7eZouelAHgBq2s1X0c4Ssp8vJMOx_35pqpfuVdTYf88prOPaqHagn_rqtXpgxTI3lNkT0TZebMFalN2QJO-78gPS2Wl_84COzoF6ePiiVqh1pKXILllfD3DDUvRl-KCk0LrEE7napg"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1 text-apexOrangeLight mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h4 className="text-lg font-bold text-apexBlue">Aditya Deshmukh</h4>
                <p className="text-slate-600 font-semibold text-sm">COEP Pune (Computer Engineering)</p>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed italic">"The preference list provided by Apex was the key. I got my dream college in CAP Round 1!"</p>
              </div>
            </motion.div>
            {/* Testimonial 2 */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 transition-all group"
            >
              <div className="relative h-48 bg-slate-200">
                <img
                  alt="Testimonial Thumbnail"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmRX6f4cGEgfuk1OLa8Aaw2xjlHLKQhmsHUmF-nynqIipshSz_IDNEtpsWqzkC0RQ4qCWWnc7FqX7kwSrbBbAjf-HdJANO1Z6Uq3INRoYosDWC4nn0z12IMU7GUM_fNVBEuRShDL6SHLQj3ZGHXu1AkuEzA60m1sHOjmdsoORLXwhYOAnK553yI438PszdAAYaqBLYx4NyuE6iWzVPLjf1aPLA4wKP-vdmZ47nvoPsi__JFHT6Y4XPDsiyc9RDSimezx5ehAIcLw"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center transition-transform cursor-pointer"
                  >
                    <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-1 text-apexOrangeLight mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <h4 className="text-lg font-bold text-apexBlue">Sakshi Patil</h4>
                <p className="text-slate-600 font-semibold text-sm">PICT Pune (IT Engineering)</p>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed italic">"Extremely professional and knowledgeable. They knew exactly which colleges I should target with my percentile."</p>
              </div>
            </motion.div>
            {/* Testimonial Placeholder */}
            <motion.div 
              variants={fadeIn}
              className="bg-slate-100 rounded-3xl overflow-hidden shadow-sm border border-dashed border-slate-300 flex items-center justify-center p-8"
            >
              <p className="text-slate-400 font-medium">Coming Soon...</p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
}