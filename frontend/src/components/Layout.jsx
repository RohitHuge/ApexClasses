import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../utils/appwrite';
import { User, LogOut, ShoppingBag, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const u = await getCurrentUser();
    setUser(u);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans scroll-smooth min-h-screen flex flex-col">
      {/* BEGIN: Sticky Header */}
      <header className="sticky top-0 z-50 glass-header border-b border-white/10 shadow-lg">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo Area */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-apexBlue font-bold text-xl">A</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white uppercase">
              Apex <span className="text-blue-200 font-medium">Counselling</span>
            </span>
          </Link>
          {/* Navigation Links */}
          <div className="hidden xl:flex items-center gap-8 text-sm font-semibold text-blue-100">
            <Link className="hover:text-apexOrangeLight transition-colors" to="/">Home</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/why">Why Counselling</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/services">Services</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/book">Counselling Book</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/track-record">Track Record</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/jlpt-n5">JLPT N5</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/about">About Us</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/courses">Courses</Link>
          </div>
          {/* CTA & Account Area */}
          <div className="flex items-center gap-4">
            {!user ? (
               <Link to="/order" className="hidden md:block bg-orange-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm animate-glow hover:scale-105 transition-transform shadow-lg shadow-apexOrange/30">
                  Book Counselling
               </Link>
            ) : (
                <div 
                    className="relative hidden md:block"
                    onMouseEnter={() => setIsAccountOpen(true)}
                    onMouseLeave={() => setIsAccountOpen(false)}
                >
                    <button className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-white/20 transition-all border border-white/20">
                       <div className="w-8 h-8 bg-apexOrange rounded-lg flex items-center justify-center shadow-lg shadow-apexOrange/20">
                          <User size={18} className="text-white" />
                       </div>
                       <div className="text-left">
                          <p className="text-[10px] text-blue-200 leading-none mb-1 uppercase tracking-widest font-black">Logged in as</p>
                          <p className="leading-none flex items-center gap-1">
                             {user.name.split(' ')[0]} 
                             <ChevronDown size={14} className={`transition-transform duration-300 ${isAccountOpen ? 'rotate-180' : ''}`} />
                          </p>
                       </div>
                    </button>

                    <AnimatePresence>
                        {isAccountOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-[100]"
                            >
                                <Link to="/orders" className="flex items-center gap-3 w-full p-3 text-sm font-bold text-blue-100 hover:bg-white/10 rounded-xl transition-all group">
                                    <ShoppingBag size={18} className="text-apexOrange group-hover:scale-110 transition-transform" />
                                    My Orders
                                </Link>
                                <Link to="/dashboard" className="flex items-center gap-3 w-full p-3 text-sm font-bold text-blue-100 hover:bg-white/10 rounded-xl transition-all group">
                                    <LayoutDashboard size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                    Dashboard
                                </Link>
                                <div className="h-px bg-white/10 my-2 mx-2" />
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-3 text-sm font-bold text-red-400 hover:bg-red-400/10 rounded-xl transition-all group"
                                >
                                    <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
            {/* Mobile Menu Toggle */}
            <button className="xl:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </nav>
        {/* Mobile menu, show/hide based on menu state. */}
        {isMobileMenuOpen && (
          <div className="xl:hidden bg-apexBlue p-4 space-y-4 border-b border-white/10 shadow-2xl">
            {user && (
               <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 mb-4">
                  <div className="w-12 h-12 bg-apexOrange rounded-xl flex items-center justify-center shadow-lg shadow-apexOrange/20">
                     <User size={24} className="text-white" />
                  </div>
                  <div>
                     <p className="text-xs text-blue-200 uppercase tracking-widest font-black">Account</p>
                     <p className="text-lg font-bold text-white">{user.name}</p>
                  </div>
               </div>
            )}
            
            <Link className="block text-white hover:text-apexOrangeLight font-medium p-2" to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link className="block text-white hover:text-apexOrangeLight font-medium p-2" to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <Link className="block text-white hover:text-apexOrangeLight font-medium p-2" to="/why" onClick={() => setIsMobileMenuOpen(false)}>Why Counselling</Link>
            <Link className="block text-white hover:text-apexOrangeLight font-medium p-2" to="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link className="block text-white hover:text-apexOrangeLight font-medium p-2" to="/book" onClick={() => setIsMobileMenuOpen(false)}>Counselling Book</Link>
            
            {user ? (
               <div className="space-y-2 pt-4 border-t border-white/10">
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full bg-white/10 text-white p-4 rounded-xl font-bold">
                     <LayoutDashboard size={20} className="text-blue-400" />
                     Dashboard
                  </Link>
                  <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 w-full bg-white/10 text-white p-4 rounded-xl font-bold">
                     <ShoppingBag size={20} className="text-apexOrange" />
                     My Orders
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full bg-red-500/10 text-red-400 p-4 rounded-xl font-bold">
                     <LogOut size={20} />
                     Logout
                  </button>
               </div>
            ) : (
               <Link to="/order" onClick={() => setIsMobileMenuOpen(false)} className="block w-full bg-orange-gradient text-white px-6 py-4 rounded-xl font-bold text-center shadow-lg shadow-apexOrange/30">
                  Book Counselling
               </Link>
            )}
          </div>
        )}
      </header>
      {/* END: Sticky Header */}

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-apexBlue text-white py-12" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-apexBlue font-bold text-xl">A</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white uppercase">
                Apex <span className="text-blue-200 font-medium">Counselling</span>
              </span>
            </div>
            <p className="text-blue-100 max-w-sm mb-8">
              Empowering students to reach their full potential through expert academic and career guidance. Let's build your future together.
            </p>
            <div className="flex gap-4">
              {/* Social Links would go here */}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-blue-100">
              <li><Link to="/" className="hover:text-apexOrangeLight">Home</Link></li>
              <li><Link to="/about" className="hover:text-apexOrangeLight">About Us</Link></li>
              <li><Link to="/why" className="hover:text-apexOrangeLight">Why Us</Link></li>
              <li><Link to="/services" className="hover:text-apexOrangeLight">Services</Link></li>
              <li><Link to="/book" className="hover:text-apexOrangeLight">Counselling Book</Link></li>
              <li><Link to="/track-record" className="hover:text-apexOrangeLight">Track Record</Link></li>
              <li><Link to="/jlpt-n5" className="hover:text-apexOrangeLight">JLPT N5</Link></li>
              <li><Link to="/courses" className="hover:text-apexOrangeLight">Courses</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <p className="text-blue-100 mb-2">Apex classes, opp Macdonald's, ABC Nirman building, Dange chowk road , Thergoan, pune-33.</p>
            <p className="text-blue-100 mb-2">9975941794, 9049082408, 9860821154</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-center text-blue-200 text-sm">
          &copy; 2026 Apex Counselling Group. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
