import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ProductProvider } from './context/ProductContext';
import Home from './pages/home'
import Services from './pages/Services'
import WhyCounselling from './pages/WhyCounselling'
import CounsellingBook from './pages/CounsellingBook'
import BookIndex from './pages/BookIndex'
import TrackRecord from './pages/TrackRecord'
import AboutUs from './pages/AboutUs'

import JLPTN5 from './pages/JLPTN5'
import Dashboard from './pages/Dashboard'
import BookReader from './pages/BookReader'
import CourseLayout from './courses/CourseLayout'
import CoursesLanding from './courses/pages/CoursesLanding'
import ClassPage from './courses/pages/ClassPage'
import SubjectPage from './courses/pages/SubjectPage'
import OrderPage from './order/OrderPage'
import OrderHistory from './order/components/OrderHistory'
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
      <ProductProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/why" element={<WhyCounselling />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book" element={<CounsellingBook />} />
          <Route path="/book/index" element={<BookIndex />} />
          <Route path="/track-record" element={<TrackRecord />} />
          <Route path="/jlpt-n5" element={<JLPTN5 />} />
          
          {/* Order Module Routes */}
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<OrderHistory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/view-book/:id" element={<BookReader />} />
          
          {/* Admin Tools (Hidden) */}
          <Route 
            path="/admin/nexus-terminal" 
            element={
              <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>}>
                <AdminDashboard />
              </Suspense>
            } 
          />
          
          {/* Courses Module Routes */}
          <Route path="/courses" element={<CourseLayout />}>
            <Route index element={<CoursesLanding />} />
            <Route path=":class" element={<ClassPage />} />
            <Route path=":class/:subject" element={<SubjectPage />} />
            <Route path=":class/:subject/:chapter" element={<SubjectPage />} />
            <Route path=":class/:subject/:chapter/:topic" element={<SubjectPage />} />
          </Route>
        </Routes>
      </ProductProvider>
    </Router>
  )
}

export default App
