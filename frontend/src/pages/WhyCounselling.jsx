import React from 'react';
import Layout from '../components/Layout';

export default function WhyCounselling() {
  return (
    <Layout>
      <div className="bg-slate-50 font-display text-slate-900">
        <div className="relative flex h-auto w-full flex-col overflow-x-hidden">
          {/* Hero Section */}
          <section className="relative py-20 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden bg-apexBlue min-h-[500px] flex items-center shadow-2xl">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDaQQPgP91RkzINxOO05ZrzDuDFbWoJoxJelWvNbTordVWlf-REMz9hqX636Hw1KdMelbgi2tOf_00KSiM0uvODVwzUCrz_pf7efmUunfpPk2P4tHY5LcWS7Eu4SsVfiIgY_5z9_Jn_1rZBVQvsi4Y3GmrYDmAbw54F7tsGbV7ALzijA26g4SK4OrjKpEoLSHc6TnaT_jJGAKEdG_-GRph_rdgeapdLj0qsl-1LX2Y1KKuMdHx961yc8ncRCxexxyzmNj_qM8yheg")', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-apexBlue via-apexBlue/80 to-transparent"></div>
                <div className="relative z-10 p-8 md:p-16 max-w-2xl">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-apexOrange/20 text-apexOrange font-bold text-xs uppercase tracking-widest mb-6 border border-apexOrange/30">Expert Guidance</span>
                  <h1 className="text-white text-4xl md:text-6xl font-black leading-tight mb-6">
                    Why You Need Expert <span className="text-apexOrange">Counselling?</span>
                  </h1>
                  <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10">
                    Navigating the complex admission landscape requires precision, data-driven decisions, and expert guidance to secure your seat in your dream college.
                  </p>
                  <button className="flex items-center gap-3 bg-apexOrange text-white px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-apexOrange/30">
                    <span>Book Free Consultation</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Preference Complexity */}
          <section className="py-16 px-6 md:px-20 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-apexOrange to-apexBlue rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="relative bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                    <h2 className="text-3xl font-bold text-apexBlue mb-6">The Complexity of Choice</h2>
                    <p className="text-slate-600 text-lg leading-relaxed mb-6">
                      The admission form allows up to <span className="font-bold text-apexOrange">300+ preference selections</span>. Without proper planning, one wrong move in your priority list can cost you an entire academic year or a seat in a top-tier college.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-apexOrange font-black text-2xl mb-1">300+</div>
                        <div className="text-xs font-semibold uppercase text-slate-500">Form Selections</div>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="text-apexOrange font-black text-2xl mb-1">Top 1%</div>
                        <div className="text-xs font-semibold uppercase text-slate-500">Target Accuracy</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2">
                <img
                  alt="Student filling out admission forms"
                  className="rounded-3xl shadow-2xl"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDgkT-0wi8ITROIy7bksetzkVOrNe_syNE1symjq60C4KZkJWeI9-c1es2W4Orp_f4JKGBf88j2y44fGgnXc4ZnE4dOJMHYGjeYyV9qUwtrc-9ZdqkdZ65Br3ILrZpOQclVbbwR0Yrd0zG-NfGaU0KTJzWs14Ck9wrW6iDInIGBR5NVJRZtS6RdmaJnbM8LVkepu6aguhIikp7RcVdHVDPjWuKtAlcrn3-tf3B-Jxs7F3aywImVk2BuaPSd0uHTX35x79bhjamwdg"
                />
              </div>
            </div>
          </section>

          {/* Why Paid Counsellor Section */}
          <section className="py-20 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-black text-apexBlue mb-4">Why a Paid Counsellor Matters?</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">Expertise that turns your marks into a career. We don't just guess; we use historical data to ensure your future.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                  <div className="w-14 h-14 bg-apexOrange/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-apexOrange text-3xl">analytics</span>
                  </div>
                  <h3 className="text-xl font-bold text-apexBlue mb-4">5-Year Cutoff Trends</h3>
                  <p className="text-slate-600">Deep analysis of historical data to predict current year trends with high accuracy across all categories.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                  <div className="w-14 h-14 bg-apexOrange/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-apexOrange text-3xl">apartment</span>
                  </div>
                  <h3 className="text-xl font-bold text-apexBlue mb-4">68 Colleges in Pune</h3>
                  <p className="text-slate-600">Personalized selection from the best branches across 68 prestigious engineering colleges in the Pune hub.</p>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-2 transition-all">
                  <div className="w-14 h-14 bg-apexOrange/10 rounded-2xl flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-apexOrange text-3xl">fact_check</span>
                  </div>
                  <h3 className="text-xl font-bold text-apexBlue mb-4">Zero Error Process</h3>
                  <p className="text-slate-600">Step-by-step guidance on document verification and option form filling to eliminate any rejection risk.</p>
                </div>
              </div>
            </div>
          </section>

          {/* TFWS Benefit Banner */}
          <section className="py-12 px-6 md:px-20">
            <div className="max-w-7xl mx-auto">
              <div className="bg-gradient-to-r from-apexOrange to-orange-600 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
                <div className="absolute right-0 top-0 opacity-10">
                  <span className="material-symbols-outlined text-[200px] -rotate-12 translate-x-20">savings</span>
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined bg-white/20 p-2 rounded-lg">savings</span>
                    <span className="font-bold tracking-widest uppercase text-sm">Financial Benefit</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">Save ₹4-5 Lakhs with TFWS</h2>
                  <p className="text-white/80 text-lg md:max-w-xl">Students with an annual family income under <span className="font-bold text-white underline decoration-white/30 decoration-4 underline-offset-4">8 Lakhs</span> can avail Tuitions Fee Waiver Scheme benefits through our expert application guidance.</p>
                </div>
                <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 min-w-[280px] shadow-lg">
                  <div className="text-center">
                    <div className="text-sm font-medium mb-1 opacity-80 uppercase">Potential Savings</div>
                    <div className="text-4xl font-black">₹5,00,000</div>
                    <hr className="my-4 border-white/20" />
                    <button className="w-full py-3 bg-white text-apexOrange font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-md">Check Eligibility</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* College Options Visualization */}
          <section className="py-20 px-6 md:px-20 bg-slate-50">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                <div>
                  <h2 className="text-3xl font-black text-apexBlue mb-2">Massive Choice Landscape</h2>
                  <p className="text-slate-600">There are 450+ engineering colleges in Maharashtra. We help you filter the noise.</p>
                </div>
                <div className="flex items-center gap-2 text-apexOrange font-bold">
                  <span className="material-symbols-outlined">map</span>
                  <span>Coverage: Maharashtra State</span>
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'COEP Pune', branches: 16 },
                  { name: 'VIT Pune', branches: 18 },
                  { name: 'PCCOE Pune', branches: 14 },
                  { name: 'PCCOER Pune', branches: 10 }
                ].map((item) => (
                  <div key={item.name} className="bg-white p-6 rounded-2xl border-b-4 border-apexOrange shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-apexBlue font-bold text-lg mb-4">{item.name}</h4>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-apexOrange">{item.branches}</span>
                      <span className="text-slate-500 text-sm">Branches</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-12 bg-apexBlue p-6 rounded-2xl flex flex-col md:flex-row items-center justify-center gap-8 text-white shadow-xl">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-apexOrange text-4xl">domain</span>
                  <div className="text-2xl font-bold">450+ <span className="text-sm font-normal block text-slate-300">Total Colleges in MS</span></div>
                </div>
                <div className="h-10 w-[1px] bg-white/20 hidden md:block"></div>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-apexOrange text-4xl">edit_note</span>
                  <div className="text-2xl font-bold">3000+ <span className="text-sm font-normal block text-slate-300">Branch Combinations</span></div>
                </div>
              </div>
            </div>
          </section>

          {/* Guided by 18+ Years of Experience */}
          <section className="py-20 px-6 md:px-20 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
              <div className="w-full lg:w-1/2 order-2 lg:order-1">
                <div className="grid grid-cols-2 gap-6">
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                    <img
                      alt="Counsellor working with student"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqSvCNFV5U7VEvmoTmWaMysRdqBfZ-ShcbJF8_epksSbwULQQ9LyM48h1-Jr1N8pNZioik5X4Bd_7JhQV9ENr7N4RVps6bX5-JaYKkcUGnfcr4ZxIz0nkPpQ88uM4GGH6wXVvlSyVEjR5SHt80bCnvtJoY9ebCqzSJjcdt7WtMKRDkGzPXqIgdtyptX5__tI_r4Z_0MktsZe22mqVj72Xtx5IWcqfZ8s5B_ZsTfr4jbA73vsusQJn9QktW1CJw0KqjSNmYk1-ikg"
                    />
                  </div>
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-lg translate-y-8 border border-slate-100">
                    <img
                      alt="Team meeting"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNy25FhGkfmzvvBDA7yyn7InsnPUFZg4WaW2zNxVo0KK1TotiRGsHsk9gbgR3i3Amw6QycXTdaTbCvdmqmQngXEIdUk23f2VmeLr8BKpXce4PXoVBEctcizu7tV2buEIGMPBNC-i-s4Bk6ygFro2-jm-rt9atul85JoQvhHK09Duu_iqI9bdpoJX82n_fYH0U38A2L1KolUufsuD0KEs-qeEZmrvHygjVUsWRuCIe_Qh63rGZpcYl5OjhGirIzTF0OkydqkvRKzQ"
                    />
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <h2 className="text-3xl md:text-4xl font-black text-apexBlue mb-8 leading-tight">Guided by 18+ Years of <span className="text-apexOrange">Experience</span></h2>
                <ul className="space-y-6">
                  {[
                    { title: 'ARC/FC Centre Experts', desc: 'Our team includes professionals who have worked in Admission Reporting Centers (ARC) and Facilitation Centers (FC).' },
                    { title: 'Rigorous Documentation Support', desc: 'Complete verification of Caste, EWS, Income, and Domicile certificates before the final round.' },
                    { title: 'Personalized Roadmap', desc: 'Tailored choice lists specifically designed for your percentile and preference of location/branch.' }
                  ].map((item) => (
                    <li key={item.title} className="flex items-start gap-4 group">
                      <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-apexOrange/20 flex items-center justify-center group-hover:bg-apexOrange group-hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-apexOrange text-sm group-hover:text-white">check</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-apexBlue text-lg mb-1">{item.title}</h4>
                        <p className="text-slate-600">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6 md:px-20">
            <div className="max-w-4xl mx-auto text-center bg-apexBlue p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-apexOrange rounded-full blur-[100px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
              <h2 className="text-3xl md:text-5xl font-black text-white mb-6">Ready to secure your future?</h2>
              <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">Don't risk your admission. Join the thousands of successful students who used Apex Counselling Group.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button className="w-full sm:w-auto px-10 py-4 bg-apexOrange text-white font-bold rounded-full text-lg hover:scale-105 transition-transform shadow-lg shadow-apexOrange/30">Get Started Today</button>
                <button className="w-full sm:w-auto px-10 py-4 border border-white/30 text-white font-bold rounded-full text-lg hover:bg-white/10 transition-colors">Call Our Experts</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
