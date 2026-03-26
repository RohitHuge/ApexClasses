import React from 'react';
import { Outlet } from 'react-router-dom';
import Layout from '../components/Layout';
import Breadcrumbs from './components/Breadcrumbs';
import { motion } from 'framer-motion';

const CourseLayout = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 text-slate-900 pt-8 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs />
          <motion.main
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6"
          >
            <Outlet />
          </motion.main>
        </div>
      </div>
    </Layout>
  );
};

export default CourseLayout;
