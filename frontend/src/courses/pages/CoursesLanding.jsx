import React from 'react';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import data from '../../data/courses.json';

const CoursesLanding = () => {
  return (
    <div className="space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-apexBlue mb-4">
          Our Courses
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl">
          Choose your class to browse subjects, chapters, and topics curated for your excellence.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.classes.map((cls, index) => (
          <CourseCard
            key={cls.id}
            title={cls.name}
            image={cls.image}
            link={`/courses/${cls.id}`}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesLanding;
