import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import AdminRoute from './components/AdminRoute';

import Home from './pages/home';
import Services from './pages/Services';
import WhyCounselling from './pages/WhyCounselling';
import CounsellingBook from './pages/CounsellingBook';
import BookIndex from './pages/BookIndex';
import TrackRecord from './pages/TrackRecord';
import AboutUs from './pages/AboutUs';
import JLPTN5 from './pages/JLPTN5';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import BookReader from './pages/BookReader';
import CourseLayout from './courses/CourseLayout';
import CoursesLanding from './courses/pages/CoursesLanding';
import ClassPage from './courses/pages/ClassPage';
import SubjectPage from './courses/pages/SubjectPage';
import OrderPage from './order/OrderPage';
import OrderHistory from './order/components/OrderHistory';

const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const Spinner = () => (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
    </div>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <ProductProvider>
                    <Toaster position="top-center" />
                    <Routes>
                        {/* Public */}
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/why" element={<WhyCounselling />} />
                        <Route path="/services" element={<Services />} />
                        <Route path="/book" element={<CounsellingBook />} />
                        <Route path="/book/index" element={<BookIndex />} />
                        <Route path="/track-record" element={<TrackRecord />} />
                        <Route path="/jlpt-n5" element={<JLPTN5 />} />

                        {/* Auth */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

                        {/* User */}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/order" element={<OrderPage />} />
                        <Route path="/orders" element={<OrderHistory />} />
                        <Route path="/view-book/:id" element={<BookReader />} />

                        {/* Admin — wrapped in AdminRoute guard */}
                        <Route
                            path="/admin/nexus-terminal"
                            element={
                                <AdminRoute>
                                    <Suspense fallback={<Spinner />}>
                                        <AdminDashboard />
                                    </Suspense>
                                </AdminRoute>
                            }
                        />

                        {/* Courses */}
                        <Route path="/courses" element={<CourseLayout />}>
                            <Route index element={<CoursesLanding />} />
                            <Route path=":class" element={<ClassPage />} />
                            <Route path=":class/:subject" element={<SubjectPage />} />
                            <Route path=":class/:subject/:chapter" element={<SubjectPage />} />
                            <Route path=":class/:subject/:chapter/:topic" element={<SubjectPage />} />
                        </Route>
                    </Routes>
                </ProductProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
