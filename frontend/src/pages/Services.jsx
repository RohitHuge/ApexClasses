import React from 'react';
import Layout from '../components/Layout';
import { MessageCircle, Phone, Mail, Sparkles, ShieldCheck, GraduationCap, Laptop } from 'lucide-react';

export default function Services() {
  return (
    <Layout>
      <div className="bg-slate-50 font-display text-slate-900">
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
          {/* Hero Section */}
          <section className="relative py-20 px-4 overflow-hidden">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                Counselling Services & Fees
              </h1>
              <p className="text-lg md:text-xl text-slate-600 font-normal leading-relaxed">
                Expert guidance to navigate your academic journey with confidence and clarity. Choose the plan that best fits your goals.
              </p>
              <div className="mt-10 flex justify-center">
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                  <span className="material-symbols-outlined text-apexOrange text-sm">verified</span>
                  <span className="text-sm font-medium text-slate-700">Admission Assurance Program</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing Section */}
          <section className="py-20 bg-slate-100">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* One-Time Offline */}
                <div className="flex flex-col bg-white rounded-xl border border-slate-200 p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">One-Time Offline Counselling</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-apexOrange">₹1,000</span>
                      <span className="text-slate-500 text-sm font-medium">/ session</span>
                    </div>
                  </div>
                  <button className="w-full py-3 px-6 mb-8 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-apexOrange hover:text-white transition-all">
                    Book Now
                  </button>
                  <div className="space-y-4">
                    {[
                      'One counselling session (max 1 hour)',
                      'Personalized college preference list',
                      'Hard copy based on percentile & merit',
                      'Available Saturday and Sunday'
                    ].map((feature) => (
                      <div key={feature} className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-apexOrange">check_circle</span>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FESS Online */}
                <div className="flex flex-col bg-white rounded-xl border-2 border-apexOrange p-8 shadow-2xl relative lg:scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-apexOrange text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Recommended
                  </div>
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">FESS Online Counselling</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-apexOrange">₹2,000</span>
                      <span className="text-slate-500 text-sm font-medium">/ full course</span>
                    </div>
                  </div>
                  <button className="w-full py-3 px-6 mb-8 rounded-xl bg-apexOrange text-white font-bold hover:bg-apexOrange/90 transition-all shadow-lg shadow-apexOrange/30">
                    Enroll Now
                  </button>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <span className="material-symbols-outlined text-apexOrange">check_circle</span>
                      <span className="text-sm text-slate-600 font-medium">Everything in Offline plus:</span>
                    </div>
                    {[
                      'Online expert guidance',
                      'Min 2 sessions/week after result',
                      'Form filling & Branch selection guidance',
                      'WhatsApp doubt group access',
                      'Career guidance lecture'
                    ].map((feature) => (
                      <div key={feature} className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-apexOrange">check_circle</span>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Complete Guidance */}
                <div className="flex flex-col bg-white rounded-xl border border-slate-200 p-8 hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Guidance</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-apexOrange">₹10,000</span>
                      <span className="text-slate-500 text-sm font-medium">/ until admission</span>
                    </div>
                  </div>
                  <button className="w-full py-3 px-6 mb-8 rounded-xl bg-slate-50 text-slate-900 font-bold hover:bg-apexOrange hover:text-white transition-all">
                    Get Full Support
                  </button>
                  <div className="space-y-4">
                    {[
                      'Full Documentation support',
                      'Admission & Option form filling',
                      'CAP round specialized guidance',
                      'Assistance until final admission',
                      'Dedicated faculty for student doubts'
                    ].map((feature) => (
                      <div key={feature} className="flex gap-3 items-start">
                        <span className="material-symbols-outlined text-apexOrange">check_circle</span>
                        <span className="text-sm text-slate-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Enquiry Section */}
          <section className="py-20 px-4 bg-white relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
              <div className="bg-apexBlue rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
                {/* Background Design Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-apexOrange/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                {/* Decorative Lucide Icons */}
                <div className="absolute top-10 left-10 text-white/5 -rotate-12 pointer-events-none">
                  <Sparkles size={80} />
                </div>
                <div className="absolute bottom-10 right-10 text-white/5 rotate-12 pointer-events-none">
                  <ShieldCheck size={100} />
                </div>
                <div className="absolute top-1/2 left-20 text-white/5 -translate-y-1/2 rotate-6 pointer-events-none hidden lg:block">
                  <GraduationCap size={70} />
                </div>
                <div className="absolute bottom-1/4 right-24 text-white/5 -rotate-6 pointer-events-none hidden lg:block">
                  <Laptop size={60} />
                </div>

                <div className="relative z-10">
                  <div className="text-center mb-10">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white font-bold text-xs uppercase tracking-widest mb-4 border border-white/20">Get Support</span>
                    <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Quick Enquiry</h2>
                    <p className="text-blue-100/80 text-base max-w-xl mx-auto">Questions? Reach out via any channel below and get instant expert guidance.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                      { icon: <MessageCircle size={28} />, title: 'WhatsApp', desc: 'Instant Chat', color: 'text-emerald-400', bg: 'bg-emerald-400/10', hover: 'hover:border-emerald-400' },
                      { icon: <Phone size={28} />, title: 'Call Us', desc: 'Mon-Sat (9am-6pm)', color: 'text-apexOrangeLight', bg: 'bg-apexOrangeLight/10', hover: 'hover:border-apexOrangeLight' },
                      { icon: <Mail size={28} />, title: 'Email', desc: '24/7 Support', color: 'text-blue-400', bg: 'bg-blue-400/10', hover: 'hover:border-blue-400' }
                    ].map((item) => (
                      <a 
                        key={item.title} 
                        className={`flex items-center gap-5 bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 transition-all group hover:bg-white/10 hover:shadow-2xl ${item.hover}`} 
                        href="#"
                      >
                        <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform flex-shrink-0`}>
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white mb-0.5">{item.title}</p>
                          <p className="text-xs text-blue-200">{item.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
