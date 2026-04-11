import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';

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

const GoalCard = ({ icon, title, description, delay }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
  
  return (
    <div 
      ref={ref}
      className={`bg-white p-8 rounded-2xl shadow-sm border border-slate-100 transition-all duration-700 transform hover:-translate-y-2 hover:shadow-xl ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-apexBlue/5 rounded-xl flex items-center justify-center mb-6 text-apexBlue">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-3 text-apexBlue">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

const ContactInfo = ({ icon, label, value, delay, isPrimary = false }) => {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div 
      ref={ref}
      className={`flex items-center gap-6 p-6 rounded-2xl border border-slate-100 transition-all duration-700 transform ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
      } ${isPrimary ? 'bg-slate-50' : 'bg-white'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`p-4 rounded-full ${isPrimary ? 'bg-apexOrange/10 text-apexOrange' : 'bg-apexBlue/5 text-apexBlue'}`}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
        <p className={`font-bold ${isPrimary ? 'text-xl text-apexBlue' : 'text-lg text-slate-700'}`}>{value}</p>
      </div>
    </div>
  );
};

export default function AboutUs() {
  const [heroRef, heroVisible] = useIntersectionObserver({ threshold: 0.1 });
  const [goalsRef, goalsVisible] = useIntersectionObserver({ threshold: 0.1 });

  const goals = [
    { icon: "account_balance", title: "Choose Right College", description: "Comprehensive evaluation of institutions based on placement records, faculty, and infrastructure.", delay: 100 },
    { icon: "hub", title: "Select Best Branch", description: "Aligning your academic strengths and future career interests with the right specialization.", delay: 200 },
    { icon: "edit_document", title: "Form Filling Support", description: "Zero-error assistance in filling option forms to ensure your priorities are correctly represented.", delay: 300 },
    { icon: "verified_user", title: "Smooth Admission", description: "End-to-end management of the admission lifecycle, from document verification to final seat allotment.", delay: 400 },
  ];

  return (
    <Layout>
      <main className="font-display overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-24 bg-apexDeep text-white">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div 
                ref={heroRef}
                className={`flex-1 text-center lg:text-left transition-all duration-1000 transform ${
                  heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
              >
                <span className="inline-block px-4 py-1.5 rounded-full bg-apexOrange/20 text-apexOrange font-bold text-xs uppercase tracking-widest mb-6">Expert Guidance Since 2010</span>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-8">
                  About <span className="text-apexOrange">Apex</span> Counselling Group
                </h1>
                <p className="text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed mb-10">
                  We provide expert, personalized counselling for Engineering and Pharmacy admissions across Maharashtra. Our mission is to bridge the gap between student aspirations and their dream institutions.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  <a className="bg-apexOrange text-white px-8 py-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-xl shadow-apexOrange/20" href="https://apexclasses.org" target="_blank" rel="noopener noreferrer">
                    Visit apexclasses.org
                    <span className="material-symbols-outlined">open_in_new</span>
                  </a>
                </div>
              </div>
              <div className="flex-1 w-full max-w-xl group">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white/5 relative">
                  <img 
                    className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-700" 
                    alt="Apex Counselling Group Team" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8AbNh_r3a6pc4ncmULuM7EWdCjTzDHguivH7qa4x_4I02sYoslQg3vjBQHSmB3I2wifrblrnFU4_DC7V1Xcm7R2P-E-8hT2cN0-0HJm5Ihz4OA163o7b66Ckj4g_HgZEeCCNxJim_0GZMfxjaEYV0-McV6l_ThNLP2EFtFY5DNAPl9Dt9mW12qgIEZHQmr9nibTxvmYUjXIK7O20Jxa_BDztkUPjWhxFz_HvPNVhpyz8Oq6sLsdkMsnrNyxhhGzChp3uahibCkw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-apexDeep/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20" ref={goalsRef}>
              <h2 className={`text-4xl font-bold text-apexBlue mb-4 transition-all duration-700 ${goalsVisible ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>Our Core Goals</h2>
              <div className={`w-20 h-1.5 bg-apexOrange mx-auto rounded-full transition-all duration-700 delay-300 ${goalsVisible ? 'w-20' : 'w-0'}`}></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {goals.map((goal, idx) => (
                <GoalCard key={goal.title} {...goal} />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-20">
              <div className="flex-1">
                <h2 className="text-4xl font-black text-apexBlue mb-6">Get in Touch</h2>
                <p className="text-lg text-slate-600 mb-12 max-w-lg">Call or WhatsApp for expert counselling or to book your admission guidebooks. We are here to help.</p>
                
                <div className="space-y-6 mb-12">
                  <ContactInfo 
                    icon="call" 
                    label="Direct Lines" 
                    value="9975941794, 9049082408, 9860821154" 
                    delay={100} 
                    isPrimary 
                  />
                  <ContactInfo 
                    icon="location_on" 
                    label="Thergaon Office" 
                    value="Apex classes, opp Macdonald's, ABC Nirman building, Dange chowk road, Thergoan, pune-33" 
                    delay={200} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a 
                    href="tel:9975941794"
                    className="bg-apexBlue text-white flex items-center justify-center gap-3 py-5 rounded-2xl font-bold hover:bg-apexDeep transition-all shadow-xl shadow-apexBlue/20"
                  >
                    <span className="material-symbols-outlined">phone_in_talk</span>
                    Call Now
                  </a>
                  <a 
                    href="https://wa.me/919860821154?text=Hi%20Apex%20Classes,%20I'd%20like%20to%20get%20in%20touch%20regarding%20admission%20counselling."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] text-white flex items-center justify-center gap-3 py-5 rounded-2xl font-bold hover:bg-[#21b858] transition-all shadow-xl shadow-green-500/20"
                  >
                    <span className="material-symbols-outlined">chat</span>
                    WhatsApp Us
                  </a>
                </div>
              </div>

              <div className="flex-1">
                <div className="h-full min-h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-100 relative group">
                  <img 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                    alt="Maharashtra Regional Office" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt6g497sUZEePtsmpTpTVBXcuiwGIfu-OydVny5oRh-IHe0fywTyTLgx_BkBrzOePLIX6WNZBlur09CtmpNsI8G55M85LX3DEZo3biB-kbQG6P4d1_p09z1IeOO8AWqHCzSvmqaoYWPvyOnVWjKEimhmgcJrZB8TGE37uNfCnewBK5NoDJiO9HDHB5zFTByqCK73YNm9WBG5Wz3uILqfZUAgvQy0y6zafoZMUqmOb_NZhgWRDHzR4WZEfg31m6bq94GzcAqYGu7w"
                  />
                  <div className="absolute inset-0 bg-apexBlue/10 group-hover:bg-transparent transition-all duration-700"></div>
                  <div className="absolute bottom-8 left-8 right-8 bg-white p-8 rounded-3xl shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-apexBlue text-xl mb-1">Thergaon Office</h4>
                        <p className="text-sm text-slate-500 font-medium">Regional Headquarters (PCMC)</p>
                      </div>
                      <div className="bg-apexOrange p-4 rounded-2xl text-white shadow-lg shadow-apexOrange/30">
                        <span className="material-symbols-outlined">directions</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
