import React from 'react';
import Layout from '../components/Layout';

const JLPTN5 = () => {
  return (
    <Layout>
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-32 bg-gradient-to-br from-orange-500 to-orange-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block text-white font-bold tracking-widest uppercase text-xs mb-4 px-3 py-1 bg-white/20 rounded-full">
                Foundation Course
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">
                JLPT <span className="text-orange-900/50 block md:inline">(Japanese Language Proficiency Test)</span>
              </h1>
              <p className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed mb-8">
                Master the fundamentals of the Japanese language with our expert-led N5 certification program. Designed for the architectural precision required in modern linguistics.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-slate-900 text-white px-8 py-4 font-bold rounded-xl active:scale-95 transition-transform hover:bg-slate-800 shadow-xl shadow-slate-900/20">
                  Enroll Now
                </button>
                <button className="border-2 border-white/30 text-white px-8 py-4 font-bold rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm">
                  Download Syllabus
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-3xl border border-white/20 shadow-2xl">
                <img 
                  alt="JLPT Learning" 
                  className="w-full h-[400px] object-cover rounded-2xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4X-CheCIfcdOkgAbzi_wrwoy0DJMw_ooquKutx6rgGfabQ8MnAbRe4xAhn2y05HaGUgsXOsTddbI2qRPWfY9gDAXalDSe-Yk5GfezyDW0lBgxd7e-SfjFYVjTNbQTDuqfZCH3qYGIHHlfMMiPecnR7VLQK_PTJbZwcEn6ZjhAcIzKTfIRvvDTim3XxLCSYsfTBdo-qkN3xXlh2d39Qg4zkn3UjqSnTiJvMYr5-ZMHDQT2ATBa_YhlVmluEPcHEhnuxLt4BtFFmQ"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24 bg-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
                  Why Learn JLPT N5?
                </h2>
                <div className="w-16 h-1.5 bg-orange-500 mb-6 rounded-full"></div>
                <p className="text-slate-400 text-lg">
                  The N5 level is the essential gateway to Japanese fluency, focusing on basic expressions and fundamental literacy.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Benefit 1 */}
              <div className="bg-orange-600/10 p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300 border border-orange-500/20">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Understand basic vocabulary</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Gain mastery over 800+ essential words used in daily Japanese conversations.
                </p>
              </div>

              {/* Benefit 2 */}
              <div className="bg-slate-900 p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300 border border-white/5">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Read simple sentences</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Learn to read and write Hiragana, Katakana, and basic Kanji characters with confidence.
                </p>
              </div>

              {/* Benefit 3 */}
              <div className="bg-orange-600/10 p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300 border border-orange-500/20">
                <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Build a foundation</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Create a robust grammatical structural base for advancing to N4 and professional levels.
                </p>
              </div>

              {/* Benefit 4 */}
              <div className="bg-slate-900 p-10 rounded-3xl group hover:-translate-y-2 transition-all duration-300 border border-white/5">
                <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-8">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Improve opportunities</h3>
                <p className="text-slate-400 leading-relaxed text-sm">
                  Unlock career and academic paths in Japan with a globally recognized certification.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">Our Courses</h2>
              <p className="text-slate-500 max-w-xl mx-auto">Choose the learning path that fits your lifestyle and professional goals.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
              {/* Option 1: Online Classes */}
              <div className="bg-white p-1 shadow-2xl shadow-slate-200/50 relative overflow-hidden group rounded-[2.5rem] border border-slate-100">
                <div className="w-full h-2 bg-orange-500 absolute top-0 left-0"></div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">Online Classes</h3>
                      <p className="text-orange-600 font-bold text-xs uppercase tracking-wider">Foundation Level</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Fees</p>
                      <p className="text-3xl font-bold text-slate-900">₹3,000</p>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-10 border-t border-slate-100 pt-8">
                    {[
                      { icon: 'calendar_today', text: 'Starting 10th July' },
                      { icon: 'play_circle', text: '60 Intensive lectures' },
                      { icon: 'groups', text: 'Interactive live sessions' },
                      { icon: 'schedule', text: 'Flexible timing modules' },
                      { icon: 'home', text: 'Study from home' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-600">
                        <div className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-orange-600 text-sm">{item.icon}</span>
                        </div>
                        <span className="text-sm font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform hover:bg-slate-800 shadow-xl shadow-slate-900/10">
                    Register for Online
                  </button>
                </div>
              </div>

              {/* Option 2: Offline Batches */}
              <div className="bg-slate-900 p-1 shadow-2xl shadow-orange-900/20 relative overflow-hidden group rounded-[2.5rem]">
                <div className="w-full h-2 bg-orange-500 absolute top-0 left-0"></div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">Offline Batches</h3>
                      <p className="text-orange-400 font-bold text-xs uppercase tracking-wider">Classroom Learning</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Fees</p>
                      <p className="text-3xl font-bold text-white">₹7,000</p>
                    </div>
                  </div>
                  <ul className="space-y-4 mb-10 border-t border-white/10 pt-8">
                    {[
                      { icon: 'person_pin_circle', text: 'In-person expert guidance' },
                      { icon: 'apartment', text: 'Structured environment' },
                      { icon: 'forum', text: 'Direct peer interaction' },
                      { icon: 'library_books', text: 'Library access included' },
                      { icon: 'verified', text: 'Official N5 Study Materials' }
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-slate-300">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-orange-500 text-sm">{item.icon}</span>
                        </div>
                        <span className="text-sm font-medium">{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <button className="w-full bg-orange-500 text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform hover:bg-orange-400 shadow-xl shadow-orange-500/20">
                    Apply for Offline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 p-12 md:p-20 rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-16 relative overflow-hidden border border-slate-100">
              <div className="relative z-10 max-w-2xl text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
                  Ready to start your journey?
                </h2>
                <p className="text-slate-500 text-lg mb-10 leading-relaxed">
                  Join over 5,000 students who have successfully passed their JLPT exams with our mentoring program. We provide end-to-end guidance.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                  <a className="group flex items-center gap-3 text-slate-900 font-bold hover:text-orange-600 transition-colors text-lg" href="#">
                    Speak to a Counsellor
                    <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <span className="material-symbols-outlined">arrow_forward</span>
                    </div>
                  </a>
                </div>
              </div>
              <div className="relative w-full max-w-md lg:max-w-lg">
                <div className="absolute inset-0 bg-orange-500/10 blur-[100px] rounded-full"></div>
                <img 
                  alt="Counselling" 
                  className="w-full grayscale brightness-95 contrast-110 rounded-[2.5rem] shadow-2xl relative z-10" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD37SJWmHqg4z-yCm82vW6XQ0Dh2EjG-IAl8wrAmIgJfA0hF_IikkdyZafvjrEE_Q1hyONH9luxbiUyI_DrClaHLbHmIt0yB5yrxZeFnjRX135jMDqHlozGH8OD-VzOXm_RIseKjxg_hk5MXg3U1Dg6cpGoEm0tJglWZ8-dH9lyJYT0cQPx77wlMQ8cOFZlpSfx0gO4nJJSDDNkelZqvB7u8eJJ0AVUcqHGITzTmsDPaziO57Anj2ZQHr_fLCXlpP2WOgLDJUofmw"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default JLPTN5;
