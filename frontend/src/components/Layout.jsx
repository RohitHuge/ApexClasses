import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            {/* <Link className="hover:text-apexOrangeLight transition-colors" to="/#feedback">Feedback</Link> */}
            <Link className="hover:text-apexOrangeLight transition-colors" to="/track-record">Track Record</Link>
            <Link className="hover:text-apexOrangeLight transition-colors" to="/about">About Us</Link>
            {/* <Link className="hover:text-apexOrangeLight transition-colors" to="/#contact">Contact</Link> */}
          </div>
          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block bg-orange-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm animate-glow hover:scale-105 transition-transform shadow-lg shadow-apexOrange/30">
              Book Counselling
            </button>
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
          <div className="xl:hidden bg-apexBlue p-4 space-y-4">
            <Link className="block text-white hover:text-apexOrangeLight" to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/why" onClick={() => setIsMobileMenuOpen(false)}>Why Counselling</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/services" onClick={() => setIsMobileMenuOpen(false)}>Services</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/book" onClick={() => setIsMobileMenuOpen(false)}>Counselling Book</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/#feedback" onClick={() => setIsMobileMenuOpen(false)}>Feedback</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/track-record" onClick={() => setIsMobileMenuOpen(false)}>Track Record</Link>
            <Link className="block text-white hover:text-apexOrangeLight" to="/#contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
            <button className="w-full bg-orange-gradient text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-apexOrange/30">
              Book Counselling
            </button>
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
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-lg mb-6">Contact Us</h4>
            <p className="text-blue-100 mb-2">Somewhere in Maharashtra, India</p>
            <p className="text-blue-100 mb-2">+91 98765 43210</p>
            <p className="text-blue-100">info@apexcounselling.com</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/10 text-center text-blue-200 text-sm">
          &copy; 2026 Apex Counselling Group. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
