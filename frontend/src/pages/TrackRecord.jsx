import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const useIntersectionObserver = (options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(entry.target);
      }
    }, options);

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return [elementRef, isIntersecting];
};

const StatCard = ({ college, count, fullTitle, delay, highlight = false }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div 
      ref={ref}
      className={`flex flex-col gap-3 rounded-xl p-8 border transition-all duration-700 transform group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${
        highlight 
          ? 'border-[#F24E1E]/40 bg-[#F24E1E]/5 hover:border-[#F24E1E]' 
          : 'border-slate-200 bg-white hover:border-[#1A0A62]'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className={`text-sm font-semibold uppercase tracking-wider ${highlight ? 'text-[#F24E1E]' : 'text-slate-500'}`}>
        {college}
      </p>
      <div className="flex items-end gap-2">
        <span className={`text-5xl font-black leading-none transition-colors ${
          highlight ? 'text-[#F24E1E]' : 'text-slate-900 group-hover:text-[#1A0A62]'
        }`}>
          {count}
        </span>
        <span className={`${highlight ? 'text-[#F24E1E]/70' : 'text-slate-500'} mb-1 font-medium`}>Students</span>
      </div>
      <p className={`text-xs ${highlight ? 'text-[#F24E1E]/60' : 'text-slate-400'}`}>{fullTitle}</p>
    </div>
  );
};

export default function TrackRecord() {
  const stats = [
    { college: "COEP", count: 5, fullTitle: "College of Engineering Pune", delay: 100 },
    { college: "PICT", count: 2, fullTitle: "Pune Institute of Computer Technology", delay: 200 },
    { college: "Cummins", count: 2, fullTitle: "Cummins College of Engineering for Women", delay: 300 },
    { college: "VIT", count: 3, fullTitle: "Vishwakarma Institute of Technology", delay: 400 },
    { college: "PCCOE", count: 7, fullTitle: "Pimpri Chinchwad College of Engineering", delay: 500 },
    { college: "PCCOER", count: 20, fullTitle: "PCCOE & Research", delay: 600, highlight: true },
  ];

  const partners = ["COEP PUNE", "VJTI MUMBAI", "PICT", "VIT PUNE", "MIT-WPU"];
  
  const [headerRef, headerVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [partnersRef, partnersVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <Layout>
      <main className="flex-1 font-display overflow-x-hidden">
        {/* Hero Section */}
        <section className="px-6 lg:px-40 py-20 bg-gradient-to-b from-[#F24E1E]/5 to-transparent border-t border-slate-100">
          <div 
            ref={headerRef}
            className={`max-w-4xl mx-auto text-center transition-all duration-1000 transform ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h1 className="text-slate-900 text-4xl md:text-6xl font-black leading-tight tracking-tight mb-6">
              Our <span className="text-[#F24E1E]">Proven</span> Track Record
            </h1>
            <p className="text-slate-600 text-lg md:text-xl font-normal max-w-2xl mx-auto leading-relaxed">
              Helping students secure admissions in Maharashtra's most prestigious engineering institutions through strategic guidance and expert counselling.
            </p>
          </div>
        </section>

        {/* Stats Grid Section */}
        <section className="px-6 lg:px-40 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <StatCard key={stat.college} {...stat} />
            ))}
          </div>
          <div className="mt-16 text-center animate-pulse">
            <p className="text-slate-500 text-lg italic">...and many other reputed institutions across India.</p>
          </div>
        </section>

        {/* Institution Carousel Placeholder */}
        <section className="py-24 bg-slate-50 border-y border-slate-200 overflow-hidden">
          <div className="px-6 lg:px-40" ref={partnersRef}>
            <h3 className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-14 underline decoration-[#F24E1E] underline-offset-8">Our Partner Institutions & Admissions</h3>
            <div className={`flex flex-wrap justify-center gap-6 md:gap-10 transition-all duration-1000 ${
              partnersVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              {partners.map((name, i) => (
                <div 
                  key={name} 
                  className={`flex items-center justify-center h-20 w-44 rounded-2xl shadow-lg transition-all hover:-translate-y-2 border-2 ${
                    i % 2 === 0 
                      ? 'bg-[#0D0531] border-[#0D0531] text-white shadow-[#0D0531]/20' 
                      : 'bg-white border-[#F24E1E] text-[#F24E1E] shadow-[#F24E1E]/10'
                  }`}
                >
                  <span className="text-sm font-black tracking-tight uppercase">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Enquiry Section */}
        <section className="px-6 lg:px-40 py-24 bg-white">
          <div className="max-w-5xl mx-auto rounded-[2rem] overflow-hidden bg-[#0D0531] text-white shadow-2xl relative group">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#F24E1E] via-transparent to-transparent transform scale-150 group-hover:scale-110 transition-transform duration-1000"></div>
            </div>
            <div className="relative p-10 md:p-20 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight">Ready to start your journey?</h2>
                <p className="text-slate-300 text-xl font-light">Get expert guidance for your engineering admissions today and secure your future.</p>
              </div>
              <div className="flex flex-col gap-4 w-full md:w-auto">
                <a className="flex items-center justify-center gap-3 bg-[#F24E1E] hover:bg-orange-600 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-[#F24E1E]/20" href="tel:+910000000000">
                  <span className="material-symbols-outlined">call</span>
                  Call Now
                </a>
                <a className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#21b858] text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-green-500/20" href="#">
                  <span className="material-symbols-outlined">chat</span>
                  WhatsApp
                </a>
                <a className="flex items-center justify-center gap-3 bg-slate-700 hover:bg-slate-600 text-white px-8 py-5 rounded-2xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-xl shadow-slate-900/40" href="mailto:info@apexcounselling.com">
                  <span className="material-symbols-outlined">mail</span>
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
