import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import data from '../../data/courses.json';
import { AlertCircle } from 'lucide-react';

const ClassPage = () => {
  const { class: classId } = useParams();
  const classData = data.classes.find(c => c.id === classId);

  if (!classData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle size={64} className="text-red-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Class Not Found</h2>
        <p className="text-slate-500 mb-8">The class you are looking for does not exist or has been removed.</p>
        <Link to="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
          {classData.name} Subjects
        </h1>
        <p className="text-slate-500 text-lg">
          Explore all subjects available for {classData.name}.
        </p>
      </div>

      {classData.subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {classData.subjects.map((subject, index) => (
            <CourseCard
              key={subject.id}
              title={subject.name}
              image={subject.image}
              link={`/courses/${classId}/${subject.id}`}
              delay={index * 0.1}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <p className="text-slate-500 font-medium">No subjects listed for this class yet. Stay tuned!</p>
        </div>
      )}
    </div>
  );
};

export default ClassPage;
