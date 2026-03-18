import React from 'react';
import Layout from '../components/Layout';

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
          <section className="py-24 px-4 bg-apexBlue">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold text-white mb-4">Quick Enquiry</h2>
                <p className="text-slate-300 text-lg">Have questions? Reach out to us through any channel below.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {[
                  { icon: 'chat', title: 'WhatsApp', desc: 'Instant Chat' },
                  { icon: 'call', title: 'Call Us', desc: 'Mon-Sat (9am-6pm)' },
                  { icon: 'mail', title: 'Email', desc: '24/7 Support' }
                ].map((item) => (
                  <a key={item.title} className="flex flex-col items-center gap-6 bg-white p-10 rounded-2xl border border-transparent hover:border-apexOrange transition-all group shadow-2xl" href="#">
                    <div className="w-16 h-16 rounded-full bg-apexOrange/10 flex items-center justify-center text-apexOrange group-hover:bg-apexOrange group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
