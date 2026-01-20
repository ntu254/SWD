import { Camera, LogIn, Menu, Recycle, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { NAV_ITEMS } from '../constants/greenloop';
import Button from './Button';

interface NavbarProps {
  onBookNow: () => void;
  onLogin?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookNow, onLogin }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen
          ? 'bg-white/95 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="bg-brand-500 p-2 rounded-xl text-white transform group-hover:rotate-12 transition-transform">
              <Recycle size={24} />
            </div>
            <span className="font-display text-2xl font-bold text-gray-800 tracking-tight">
              Green<span className="text-brand-500">Loop</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-8">
            {NAV_ITEMS.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-gray-600 hover:text-brand-500 font-medium transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-brand-500 after:transition-all hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 text-brand-600 font-bold hover:bg-brand-50 rounded-full transition-colors"
            >
              <LogIn size={18} />
              Đăng Nhập
            </button>
            <Button
              onClick={onBookNow}
              variant="primary"
              size="sm"
              className="hidden md:inline-flex group shadow-brand-500/20"
            >
              <Camera size={18} className="mr-2" />
              Báo Cáo Rác
            </Button>

            <button
              className="lg:hidden p-2 text-gray-600 hover:text-brand-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="flex flex-col p-4 space-y-4">
            {NAV_ITEMS.map(item => (
              <a
                key={item.label}
                href={item.href}
                className="text-lg font-medium text-gray-700 hover:text-brand-500"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <hr className="border-gray-100" />
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  if (onLogin) onLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 text-brand-600 font-bold border border-brand-200 rounded-xl hover:bg-brand-50"
              >
                Đăng Nhập
              </button>
              <Button
                onClick={() => {
                  onBookNow();
                  setIsMobileMenuOpen(false);
                }}
                fullWidth
              >
                Báo Cáo Rác
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
