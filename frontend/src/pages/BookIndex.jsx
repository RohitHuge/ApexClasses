import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: "analysis",
    icon: "monitoring",
    title: "1. MHT-CET Analysis",
    subtitle: "Trends & Registrations",
    chapters: [
      { label: "Chapter 1.1", text: "MHT-CET 2026 Registrations Analysis" },
      { label: "Chapter 1.2", text: "Different Types of Engineering Colleges" },
    ]
  },
  {
    id: "rankings",
    icon: "stars",
    title: "2. Rankings & Excellence",
    subtitle: "NIRF & Maharashtra Top 50",
    items: [
      "NIRF Ranking for IITs in 2025",
      "NIRF Ranking Parameters",
      "Top 50 Engineering Colleges in Maharashtra"
    ]
  },
  {
    id: "categories",
    icon: "domain",
    title: "3. College Categories",
    items: [
      "Government Engineering Colleges in Maharashtra",
      "Government Aided Engineering Colleges",
      "State University Managed Colleges"
    ]
  },
  {
    id: "pune",
    icon: "map",
    title: "4. Pune Engineering",
    items: [
      "Pune Engineering Colleges with MHT-CET Cutoffs",
      "Intake Capacity for A.Y. 2026-27"
    ]
  },
  {
    id: "branches",
    icon: "school",
    title: "5. Branch Wise Lists",
    gridItems: [
      "Computer", "Mechanical", "E & TC", "IT",
      "Civil", "Electrical", "AI-DS", "AI-ML"
    ]
  },
  {
    id: "special",
    icon: "format_list_bulleted",
    title: "6. Special Lists",
    items: [
      "Top 10 Engineering Colleges in Pune",
      "Autonomous Engineering Colleges",
      "Deemed / Private Universities",
      "Defence Candidate Colleges",
      "Other Colleges"
    ]
  },
  {
    id: "process",
    icon: "description",
    title: "7. Admission Process",
    items: [
      "Documents Required",
      "Fee Structure for Engineering Colleges in Pune",
      "ARC and FC Centres in Pune"
    ]
  },
  {
    id: "medical",
    icon: "vaccines",
    title: "8. Medical & Pharmacy",
    chapters: [
      { label: "Chapter 8.1", text: "MBBS Seats in Maharashtra" },
      { label: "Chapter 8.2", text: "Pharmacy Colleges Cutoffs in Pune" },
      { label: "Chapter 8.3", text: "Pharmacy Colleges in Pune" },
      { label: "Chapter 8.4", text: "Pharmacy Fee Structure" },
    ]
  },
  {
    id: "strategy",
    icon: "strategy",
    title: "9. Admission Strategy",
    strategyItems: [
      { icon: "schema", text: "Classification of 60 Seats in Branch" },
      { icon: "account_tree", text: "Admission Process Flow Chart" },
      { icon: "vpn_key", text: "How to Choose TFWS Branch Code" }
    ]
  }
];

export default function BookIndex() {
  const [activeSection, setActiveSection] = React.useState("analysis");

  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Layout>
      <div className="bg-slate-50 font-display text-slate-900 border-t border-slate-200">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="sticky top-24 space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 px-3">Quick Navigation</p>
                {sections.map(section => (
                  <a 
                    key={section.id} 
                    href={`#${section.id}`} 
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all font-medium ${
                      activeSection === section.id 
                        ? 'bg-[#1A0A62]/10 text-[#1A0A62] border-l-4 border-[#1A0A62]' 
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl ${
                      activeSection === section.id ? 'text-[#1A0A62]' : 'text-slate-400'
                    }`}>{section.icon}</span> 
                    {section.title.split('. ')[1]}
                  </a>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              <div className="mb-10">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-[#1A1A40]">
                  Inside the Guide: <span className="text-[#FF6600]">Comprehensive Index</span>
                </h1>
                <p className="text-slate-600 text-lg max-w-2xl leading-relaxed">
                  Navigate through the ultimate roadmap for Engineering & Medical admissions in Maharashtra for the 2026-27 academic year.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {sections.map((section, idx) => (
                  <div key={section.id} id={section.id} className="scroll-mt-24">
                    {section.chapters ? (
                      <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" open={idx === 0}>
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                          <div className="flex items-center gap-4">
                            <div className="size-12 rounded-full bg-[#FF6600]/10 flex items-center justify-center text-[#FF6600]">
                              <span className="material-symbols-outlined">{section.icon}</span>
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-[#1A1A40]">{section.title}</h3>
                              {section.subtitle && <p className="text-sm text-slate-500">{section.subtitle}</p>}
                            </div>
                          </div>
                          <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex flex-wrap gap-4">
                          {section.chapters.map(chap => (
                            <div key={chap.label} className="bg-slate-50 p-3 rounded-lg flex-1 min-w-[200px]">
                              <span className="text-xs font-bold text-[#FF6600] uppercase mb-1 block">{chap.label}</span>
                              <p className="text-sm font-medium text-slate-700">{chap.text}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : section.gridItems ? (
                      <div className="bg-[#FF6600]/5 border border-[#FF6600]/20 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="material-symbols-outlined text-[#FF6600]">{section.icon}</span>
                          <h3 className="text-lg font-bold text-[#1A1A40]">{section.title}</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {section.gridItems.map(item => (
                            <div key={item} className="bg-white p-3 rounded-lg text-center text-xs font-bold uppercase shadow-sm border border-[#FF6600]/10 text-slate-700">
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : section.strategyItems ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="material-symbols-outlined text-[#FF6600]">{section.icon}</span>
                          <h3 className="text-lg font-bold text-[#1A1A40]">{section.title}</h3>
                        </div>
                        <div className="space-y-3">
                          {section.strategyItems.map(item => (
                            <div key={item.text} className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="material-symbols-outlined text-slate-400">{item.icon}</span> {item.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-[#FF6600]">{section.icon}</span>
                          <h3 className="text-lg font-bold text-[#1A1A40]">{section.title}</h3>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-6">
                          {section.items.map(item => (
                            <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                              <span className="size-1.5 bg-[#FF6600] rounded-full shrink-0"></span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}

                {/* Section 10: Final Word */}
                <div className="bg-[#1A1A40] text-white rounded-xl p-8 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined text-[160px]">groups_3</span>
                  </div>
                  <div className="relative z-10 max-w-lg">
                    <h3 className="text-2xl font-black mb-2 text-white">10. Final Word</h3>
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      Need of Counsellor - Understanding why you need a professional counsellor to navigate complex choice fillings and maximize your career potential.
                    </p>
                    <Link to="/services">
                      <button className="bg-[#FF6600] hover:bg-white hover:text-[#FF6600] transition-all px-6 py-2 rounded-lg font-bold text-sm text-white">
                        Learn More About Our Services
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-white border-2 border-[#FF6600]/20 rounded-2xl shadow-xl">
                <div>
                  <h4 className="text-xl font-bold mb-1 text-[#1A1A40]">Ready to start your journey?</h4>
                  <p className="text-slate-500 text-sm">Get the full printed guide with all detailed tables and charts.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none px-8 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors">
                    Book Preview
                  </button>
                  <button className="flex-1 sm:flex-none px-8 py-3 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl shadow-lg shadow-[#FF6600]/30 transition-all">
                    Buy Guide 2026
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
