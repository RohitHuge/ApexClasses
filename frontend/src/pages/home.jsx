import React from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import CountUp from '../components/CountUp';
import { testimonials } from './TrackRecord';
import { Sparkles, ShieldCheck, MapPin, GraduationCap, ArrowRight, Cpu, Building2 } from 'lucide-react';

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
                onClick={() => navigate('/services')}
                className="bg-orange-gradient text-white px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all shadow-xl shadow-apexOrange/20"
              >
                Book Appointment
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/college-predictor')}
                className="bg-white text-apexBlue border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:border-apexBlue transition-all inline-flex items-center gap-2"
              >
                <Sparkles size={18} className="text-apexOrange" />
                Try College Predictor
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
                  <CountUp to={77} suffix="" />
                </p>
                <p className="text-sm text-slate-500 font-medium">Pune Colleges Covered</p>
              </div>
              <div>
                <p className="text-3xl font-extrabold text-apexBlue">
                  <CountUp to={100} suffix="%" />
                </p>
                <p className="text-sm text-slate-500 font-medium">Admission Success</p>
              </div>
            </div>
          </motion.div>
          {/* Right Column: Interactive College Predictor Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="flex-1 w-full max-w-xl"
          >
            <RankPreview />
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
            {/* Engineering Counselling */}
            <motion.div 
              variants={fadeIn}
              whileHover={{ scale: 1.02 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col transition-colors backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold mb-2">Engineering Counselling</h3>
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

      {/* BEGIN: College Predictor Showcase */}
      <section className="py-24 bg-white overflow-hidden">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 bg-gradient-to-br from-indigo-50 via-white to-slate-50 rounded-[3rem] p-8 lg:p-16 border border-indigo-100 shadow-sm relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2"
            >
              <span className="inline-flex items-center gap-2 text-apexOrange font-bold tracking-widest uppercase text-sm">
                <Sparkles size={14} /> Free Tool 2026
              </span>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-apexBlue mt-4 mb-6">
                See where your rank lands
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Drag the slider below and watch your rank move across 24 representative Pune
                engineering colleges. The Reach / Safe counts update in real time so you can{' '}
                <em>feel</em> where you stand before diving into the full predictor.
                Powered by 2024 closing ranks across 77 colleges and 6,000+ branch entries.
              </p>
              <ul className="space-y-3 mb-8 text-slate-700">
                {[
                    { icon: ShieldCheck, text: 'Live Reach / Safe counts at any rank' },
                    { icon: MapPin, text: 'Home-university (L-quota) aware' },
                    { icon: GraduationCap, text: '77 colleges · 28 branches · 2024 data' },
                ].map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600">
                        <f.icon size={14} />
                      </span>
                      {f.text}
                    </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => navigate('/college-predictor')}
                  className="bg-orange-gradient text-white px-10 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-apexOrange/20"
                >
                  <Sparkles size={18} />
                  Open the Full Predictor
                  <ArrowRight size={18} />
                </motion.button>
                <span className="inline-flex items-center text-sm font-semibold text-slate-500">
                  No signup. Runs in your browser.
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 w-full"
            >
              <RankLandscape />
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

      {/* BEGIN: Student Testimonials */}
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
            {testimonials.slice(0, 3).map((testimonial) => (
              <motion.div 
                key={testimonial.id}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col justify-between transition-all group animate-fade-in"
              >
                <div>
                  <div className="flex items-center gap-1 text-apexOrangeLight mb-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-slate-600 text-base leading-relaxed italic mb-6">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-6 mt-4">
                  <img
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-100"
                    src={testimonial.image}
                  />
                  <div>
                    <h4 className="font-bold text-apexBlue">{testimonial.name}</h4>
                    <p className="text-apexOrangeLight font-semibold text-xs">{testimonial.college}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeIn} className="text-center mt-12">
            <button 
              onClick={() => navigate('/track-record')}
              className="inline-flex items-center gap-2 text-apexBlue hover:text-apexOrange font-bold transition-all group"
            >
              <span>View All Student Success Stories</span>
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
            </button>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * RankPreview — animated mock showing rank input, category, HU toggle, and
 * a rank-based result card. Self-running loop, never feels intrusive.
 * ──────────────────────────────────────────────────────────────────────────── */
const RANK_PREVIEW_STEPS = [
  { id: 'rank',   label: 'Rank',            target: 12450 },
  { id: 'cat',    label: 'Category',        target: 'OBC' },
  { id: 'home',   label: 'Home University', target: 'Pune · ON' },
  { id: 'branch', label: 'Branch',          target: 'Computer' },
  { id: 'result', label: 'Result',          target: 'COEP Pune' },
];

const RANK_PREVIEW_RESULT = {
  college: 'College of Engineering, Pune',
  branch: 'Computer Engineering',
  closingRank: 14230,
  probability: 87,
  via: 'LOBCH',
};

function RankPreview() {
  const [stepIndex, setStepIndex] = React.useState(0);
  const [displayRank, setDisplayRank] = React.useState(5000);

  React.useEffect(() => {
    if (stepIndex !== 0) return;
    let raf;
    const start = performance.now();
    const from = 5000;
    const to = RANK_PREVIEW_STEPS[0].target;
    const dur = 1400;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayRank(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stepIndex]);

  React.useEffect(() => {
    const delays = [1800, 1300, 1100, 1100, 4200, 1400];
    const t = setTimeout(() => {
      setStepIndex((i) => (i + 1) % RANK_PREVIEW_STEPS.length);
    }, delays[stepIndex] ?? 2000);
    return () => clearTimeout(t);
  }, [stepIndex]);

  const isActive = (id) => RANK_PREVIEW_STEPS[stepIndex]?.id === id;
  const isDone   = (id) => {
    const idx = RANK_PREVIEW_STEPS.findIndex((s) => s.id === id);
    return idx >= 0 && idx < stepIndex;
  };

  return (
    <div className="relative w-full max-w-[420px]">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-300/30 rounded-full blur-3xl" />

      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-[11px] font-semibold text-slate-400 inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-indigo-500" />
            apexclasses.org / college-predictor
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-500">Live preview</p>
              <p className="text-sm font-bold text-slate-800">Rank Predictor</p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Searching…
            </span>
          </div>

          {/* Rank input */}
          <div className={`rounded-xl border p-3 transition-colors ${isActive('rank') || isDone('rank') ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/40'}`}>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Your MHT-CET rank</span>
              <span className="text-indigo-600 text-sm font-bold tabular-nums">{displayRank.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Category */}
          <div className={`rounded-xl border p-3 transition-colors ${isActive('cat') ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/40'}`}>
            <p className="text-[11px] font-semibold text-slate-500 mb-2">Category</p>
            <div className="flex flex-wrap gap-1.5">
              {['OPEN', 'OBC', 'SC', 'ST', 'VJ', 'NT1', 'EWS'].map((c) => {
                const highlighted = c === 'OBC' && (isActive('cat') || isDone('cat'));
                return (
                  <span key={c} className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${highlighted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'}`}>
                    {c}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Home university toggle */}
          <div className={`rounded-xl border p-3 flex items-center justify-between transition-colors ${isActive('home') || isDone('home') ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/40'}`}>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-indigo-500" />
              <div>
                <p className="text-[11px] font-semibold text-slate-700">Pune home university</p>
                <p className="text-[10px] text-slate-400">Unlocks L-quota cutoffs</p>
              </div>
            </div>
            <span className={`relative w-9 h-5 rounded-full p-0.5 transition-colors ${isActive('home') || isDone('home') ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <span className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive('home') || isDone('home') ? 'translate-x-4' : ''}`} />
            </span>
          </div>

          {/* Branch chips */}
          <div className={`rounded-xl border p-3 transition-colors ${isActive('branch') || isDone('branch') ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 bg-slate-50/40'}`}>
            <p className="text-[11px] font-semibold text-slate-500 mb-2">Preferred branch</p>
            <div className="flex flex-wrap gap-1.5">
              {['Computer', 'IT', 'AIDS', 'Mech', 'Civil'].map((b) => {
                const highlighted = b === 'Computer' && (isActive('branch') || isDone('branch'));
                return (
                  <span key={b} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition ${highlighted ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                    {b}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Result card */}
          <AnimatePresence mode="wait">
            {(isActive('result') || isDone('result')) && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                className="rounded-xl border-2 border-emerald-300 bg-emerald-50/60 p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
                    <ShieldCheck size={12} />
                    Safe · Closing rank {RANK_PREVIEW_RESULT.closingRank.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">{RANK_PREVIEW_RESULT.probability}%</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 inline-flex items-center justify-center">
                    <Building2 size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{RANK_PREVIEW_RESULT.college}</p>
                    <p className="text-[11px] text-slate-500 inline-flex items-center gap-1">
                      <Cpu size={10} />
                      {RANK_PREVIEW_RESULT.branch}
                    </p>
                  </div>
                </div>
                <div className="mt-2 h-1 rounded-full bg-emerald-200 overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${RANK_PREVIEW_RESULT.probability}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => (window.location.href = '/college-predictor')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-apexBlue text-white font-bold text-sm py-2.5 hover:bg-indigo-700 transition"
          >
            <Sparkles size={14} />
            Open the Predictor
            <ArrowRight size={14} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {isActive('result') && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            className="hidden md:flex absolute -right-4 -top-4 bg-white border border-slate-200 shadow-xl rounded-2xl px-3 py-2 items-center gap-2"
          >
            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">
              <ShieldCheck size={14} />
            </span>
            <div>
              <p className="text-[10px] font-bold text-slate-800">Match found!</p>
              <p className="text-[9px] text-slate-400">Just now · 1 of 30</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────────
 * RankLandscape — interactive rank slider showing reach/safe counts.
 * 24 representative Pune colleges sorted by closing rank (lower = harder).
 * ──────────────────────────────────────────────────────────────────────────── */
const LANDSCAPE_DATA = [
  { code: '6005', name: 'COEP',              rank: 320  },
  { code: '6028', name: 'PICT',              rank: 1200 },
  { code: '6035', name: 'VIT Pune',          rank: 2400 },
  { code: '6138', name: 'PCCOE',             rank: 4100 },
  { code: '6006', name: 'WCE Sangli',        rank: 5800 },
  { code: '6155', name: 'Sinhgad (SKN)',     rank: 8200 },
  { code: '6175', name: 'Pimpri Chinchwad',  rank: 10500 },
  { code: '6182', name: 'DY Patil Akurdi',   rank: 13100 },
  { code: '6203', name: 'Marathwada Mitra',  rank: 16400 },
  { code: '6156', name: 'AISSMS IOIT',       rank: 20000 },
  { code: '6184', name: 'GHR Labs',          rank: 24500 },
  { code: '6207', name: 'PVG',               rank: 29000 },
  { code: '6185', name: 'JSPM Narhe',        rank: 34000 },
  { code: '6188', name: 'KJ Somaiya',        rank: 40000 },
  { code: '6214', name: 'MIT WPU',           rank: 47000 },
  { code: '6223', name: 'Rajarshi Shahu',    rank: 55000 },
  { code: '6196', name: 'KJEI Trinity',      rank: 65000 },
  { code: '6220', name: 'Indira ICOE',       rank: 77000 },
  { code: '6215', name: 'Nutan Maharashtra', rank: 92000 },
  { code: '6209', name: 'Jaywant',           rank: 108000 },
  { code: '6183', name: 'Alard',             rank: 128000 },
  { code: '6219', name: 'Genba Sopanrao',    rank: 152000 },
  { code: '6222', name: 'Dattakala',         rank: 178000 },
  { code: '6270', name: 'Gharda Foundation', rank: 210000 },
];

function RankLandscape() {
  const MIN_RANK = 300;
  const MAX_RANK = 220000;
  const [rank, setRank] = React.useState(15000);
  const [hoverCode, setHoverCode] = React.useState(null);
  const [autoCycle, setAutoCycle] = React.useState(true);

  React.useEffect(() => {
    if (!autoCycle) return;
    let dir = 1;
    let val = 8000;
    const id = setInterval(() => {
      val += dir * 600;
      if (val > 180000) dir = -1;
      if (val < 2000) dir = 1;
      setRank(Math.round(val));
    }, 80);
    return () => clearInterval(id);
  }, [autoCycle]);

  const reach = LANDSCAPE_DATA.filter((c) => c.rank < rank && c.rank >= rank * 0.65).length;
  const safe  = LANDSCAPE_DATA.filter((c) => c.rank >= rank).length;

  const bucketFor = (colRank) => {
    if (colRank >= rank) return 'safe';
    if (colRank >= rank * 0.65) return 'reach';
    return 'none';
  };

  const bucketColor = { safe: 'bg-emerald-500', reach: 'bg-rose-500', none: 'bg-slate-300' };
  const bucketRing  = { safe: 'ring-emerald-300', reach: 'ring-rose-300', none: 'ring-slate-200' };

  // log scale position for the axis (rank axis is log-distributed)
  const toX = (r) => (Math.log(r) - Math.log(MIN_RANK)) / (Math.log(MAX_RANK) - Math.log(MIN_RANK)) * 100;
  const sliderX = toX(rank);

  return (
    <div
      onMouseDown={() => setAutoCycle(false)}
      onTouchStart={() => setAutoCycle(false)}
      className="relative w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Live · 2024 closing ranks</p>
          <p className="text-base font-extrabold text-slate-800">Find your spot</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your rank</p>
          <p className="text-2xl font-extrabold text-indigo-600 tabular-nums leading-none">{rank.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Axis */}
      <div className="relative h-32 mb-3">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-slate-200 -translate-y-1/2" />
        <div className="absolute inset-0">
          {LANDSCAPE_DATA.map((c) => {
            const x = toX(c.rank);
            const b = bucketFor(c.rank);
            const hovered = hoverCode === c.code;
            return (
              <div
                key={c.code}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                style={{ left: `${x}%`, transform: 'translateX(-50%)' }}
                onMouseEnter={() => setHoverCode(c.code)}
                onMouseLeave={() => setHoverCode(null)}
              >
                <div className={`rounded-full transition-all ${bucketColor[b]} ${hovered ? `w-4 h-4 ring-4 ${bucketRing[b]}` : 'w-2.5 h-2.5'}`} />
                {hovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute -top-12 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold rounded-md px-2 py-1 shadow-lg z-20"
                  >
                    {c.name} · {c.rank.toLocaleString('en-IN')}
                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-slate-900" />
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
        <motion.div
          className="absolute top-0 bottom-0 w-0.5 bg-indigo-600 z-10"
          style={{ left: `${sliderX}%` }}
          animate={{ left: `${sliderX}%` }}
          transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-indigo-600 ring-4 ring-indigo-200" />
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-indigo-600 whitespace-nowrap bg-indigo-50 px-1.5 py-0.5 rounded">
            You
          </div>
        </motion.div>
      </div>

      {/* Slider */}
      <div className="mt-6 mb-5">
        <input
          type="range"
          min={MIN_RANK}
          max={MAX_RANK}
          step={100}
          value={rank}
          onChange={(e) => { setAutoCycle(false); setRank(Number(e.target.value)); }}
          className="w-full accent-indigo-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
          <span>Top 300</span>
          <span>50k</span>
          <span>2 lakh+</span>
        </div>
      </div>

      {/* Live counts */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 text-center">
          <p className="text-xl font-extrabold text-rose-700 tabular-nums">{reach}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-600">Reach / Ambitious</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-2.5 text-center">
          <p className="text-xl font-extrabold text-emerald-700 tabular-nums">{safe}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Safe</p>
        </div>
      </div>

      <button
        onClick={() => (window.location.href = '/college-predictor')}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-apexBlue text-white font-bold text-sm py-2.5 hover:bg-indigo-700 transition"
      >
        <Sparkles size={14} />
        Open the full Predictor
        <ArrowRight size={14} />
      </button>
      {autoCycle && (
        <p className="text-[10px] text-slate-400 text-center mt-2">Drag the slider to take control</p>
      )}
    </div>
  );
}