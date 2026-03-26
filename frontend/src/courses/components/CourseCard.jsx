import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const CourseCard = ({ title, image, link, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.03 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-500/50 transition-all shadow-xl shadow-slate-200/50"
    >
      <Link to={link} className="block">
        <div className="aspect-video overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </div>
        
        <div className="p-5 flex justify-between items-center bg-white border-t border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 group-hover:text-apexBlue transition-colors">
            {title}
          </h3>
          <div className="p-2 rounded-full bg-blue-50 text-apexBlue group-hover:bg-apexBlue group-hover:text-white transition-all">
            <ChevronRight size={20} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default CourseCard;
