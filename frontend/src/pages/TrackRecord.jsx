import React, { useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';

// Import Assets
import student1 from '../assets/student_1.png';
import student2 from '../assets/student_2.png';
import video1 from '../assets/video_1.png';
import video2 from '../assets/video_2.png';

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
      staggerChildren: 0.1
    }
  }
};

const stats = [
  { college: "COEP", count: 15, color: "bg-blue-600" },
  { college: "VJTI", count: 12, color: "bg-indigo-600" },
  { college: "PICT", count: 28, color: "bg-orange-600" },
  { college: "VIT", count: 42, color: "bg-emerald-600" },
  { college: "PCCOE", count: 65, color: "bg-purple-600" },
  { college: "WCE", count: 9, color: "bg-cyan-600" },
  { college: "DJSCE", count: 14, color: "bg-rose-500" },
  { college: "SPIT", count: 11, color: "bg-amber-500" },
];

const videos = [
  { id: 1, title: "Success Story: Aditya", thumbnail: video1, duration: "4:20" },
  { id: 2, title: "How I cracked COEP", thumbnail: video2, duration: "3:45" },
  { id: 3, title: "Apex Counselling Review", thumbnail: video1, duration: "5:12" },
  { id: 4, title: "PICT Admission Guide", thumbnail: video2, duration: "2:30" },
  { id: 5, title: "MHT-CET Strategy", thumbnail: video1, duration: "6:15" },
  { id: 6, title: "VJTI Experience", thumbnail: video2, duration: "4:05" },
  { id: 7, title: "My Journey to IT", thumbnail: video1, duration: "3:50" },
  { id: 8, title: "TFWS Beneficiary", thumbnail: video2, duration: "4:45" },
  { id: 9, title: "Pharmacy Admission", thumbnail: video1, duration: "5:30" },
  { id: 10, title: "Spot Round Miracle", thumbnail: video2, duration: "3:10" },
];

const testimonials = [
  { 
    id: 1, 
    name: "Saurabh Patil", 
    college: "COEP Pune", 
    image: student1, 
    quote: "Apex Classes provided the most accurate cutoff analysis. Their preference list was the only reason I got into COEP despite the high competition." 
  },
  { 
    id: 2, 
    name: "Anjali Shinde", 
    college: "PICT Pune", 
    image: student2, 
    quote: "The personalized attention during the CAP rounds was amazing. They handled all my doubts and guided me through every step." 
  },
  { 
    id: 3, 
    name: "Rahul Mehra", 
    college: "VJTI Mumbai", 
    image: student1, 
    quote: "Strategic planning for TFWS saved me lakhs in fees. I'm forever grateful to the team at Apex for their expert advice." 
  },
  { 
    id: 4, 
    name: "Priya Kulkarni", 
    college: "VIT Pune", 
    image: student2, 
    quote: "Beyond just admissions, they helped me choose the right branch based on my career goals. Truly professional service." 
  },
];

export default function TrackRecord() {
  const [activeVideo, setActiveVideo] = useState(videos[0]);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const videoCarouselRef = useRef(null);

  // Auto-scroll testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const scrollVideos = (direction) => {
    if (videoCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      videoCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="bg-slate-50 min-h-screen font-display pb-20">
        {/* Compact Header & Stats Section */}
        <section className="pt-10 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-200/60 mb-8">
          <div className="text-center md:text-left max-w-xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl md:text-5xl font-black text-apexBlue mb-2"
            >
              Our <span className="text-apexOrange">Track Record</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm md:text-base leading-relaxed"
            >
              Since 2008, helping students secure seats in Maharashtra's premier colleges.
            </motion.p>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center md:justify-end gap-2 max-w-2xl"
          >
            {stats.map((stat) => (
              <motion.div 
                key={stat.college}
                variants={fadeIn}
                whileHover={{ scale: 1.05 }}
                className="bg-white border border-slate-200 rounded-full pl-1.5 pr-3 py-1 flex items-center gap-2 shadow-sm"
              >
                <div className={`size-6 rounded-full ${stat.color} flex items-center justify-center text-white font-black text-[10px]`}>
                  {stat.count}
                </div>
                <span className="font-bold text-apexBlue text-[10px] uppercase tracking-tighter">{stat.college}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Video Showcase Section */}
        <section className="py-12 bg-apexDeep text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-6">
              <div>
                <h2 className="text-3xl font-black mb-2">Success Stories <span className="text-apexOrange">in Action</span></h2>
                <p className="text-slate-400">Hear directly from our students about their admission journey</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollVideos('left')}
                  className="size-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
                </button>
                <button 
                  onClick={() => scrollVideos('right')}
                  className="size-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-12 items-start">
              {/* Main Video Player */}
              <motion.div 
                key={activeVideo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-2 relative aspect-video bg-slate-800 rounded-3xl overflow-hidden shadow-2xl group border border-white/10"
              >
                <img 
                  src={activeVideo.thumbnail} 
                  alt={activeVideo.title}
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="size-20 bg-apexOrange text-white rounded-full flex items-center justify-center shadow-2xl"
                  >
                    <span className="material-symbols-outlined text-4xl fill-current">play_arrow</span>
                  </motion.button>
                </div>
                <div className="absolute bottom-0 inset-x-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <span className="bg-apexOrange px-3 py-1 rounded text-xs font-bold uppercase mb-2 inline-block">Featured Story</span>
                  <h3 className="text-2xl font-bold">{activeVideo.title}</h3>
                </div>
              </motion.div>

              {/* Video Carousel Sidebar */}
              <div 
                ref={videoCarouselRef}
                className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto lg:max-h-[500px] gap-4 no-scrollbar pb-4 lg:pb-0"
              >
                {videos.map((vid) => (
                  <motion.div 
                    key={vid.id}
                    whileHover={{ x: 5 }}
                    onClick={() => setActiveVideo(vid)}
                    className={`flex-shrink-0 w-64 lg:w-full p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                      activeVideo.id === vid.id 
                        ? 'bg-white/10 border-apexOrange shadow-lg' 
                        : 'bg-white/5 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative size-16 rounded-lg overflow-hidden shrink-0">
                      <img src={vid.thumbnail} alt="" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xs">play_arrow</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold truncate">{vid.title}</h4>
                      <p className="text-xs text-slate-400">{vid.duration}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Carousel Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-apexBlue mb-4">What Our Students <span className="text-apexOrange">Say</span></h2>
            <div className="w-24 h-1.5 bg-apexOrange mx-auto rounded-full"></div>
          </div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div 
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 border border-slate-100 shadow-xl shadow-slate-200/50 relative"
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0">
                  <div className="size-24 rounded-full border-8 border-slate-50 overflow-hidden shadow-lg">
                    <img src={testimonials[testimonialIndex].image} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
                
                <div className="pt-10 md:pt-0">
                  <span className="material-symbols-outlined text-6xl text-slate-100 absolute top-8 right-8 pointer-events-none">format_quote</span>
                  <p className="text-xl md:text-2xl text-slate-700 font-medium italic leading-relaxed mb-8">
                    "{testimonials[testimonialIndex].quote}"
                  </p>
                  <div>
                    <h4 className="text-xl font-bold text-apexBlue">{testimonials[testimonialIndex].name}</h4>
                    <p className="text-apexOrange font-bold">{testimonials[testimonialIndex].college}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-4 mt-12">
              <button 
                onClick={prevTestimonial}
                className="size-12 rounded-full bg-white border border-slate-200 text-apexBlue flex items-center justify-center hover:bg-apexBlue hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <div className="flex items-center gap-2">
                {testimonials.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      testimonialIndex === i ? 'w-8 bg-apexOrange' : 'w-2 bg-slate-300'
                    }`}
                  />
                ))}
              </div>
              <button 
                onClick={nextTestimonial}
                className="size-12 rounded-full bg-white border border-slate-200 text-apexBlue flex items-center justify-center hover:bg-apexBlue hover:text-white transition-all shadow-sm"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="bg-orange-gradient rounded-[2.5rem] p-12 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-black mb-6">Want to be our next Success Story?</h2>
              <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">Join the 10,000+ students who achieved their dreams with our expert guidance.</p>
              <button className="bg-white text-apexOrange px-10 py-4 rounded-xl font-bold text-lg hover:shadow-xl hover:scale-105 transition-all">
                Contact Us Today
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
