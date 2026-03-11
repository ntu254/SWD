import { useAuth } from '@shared/contexts/AuthContext';
import { NAV_ITEMS } from '@utils/constants';
import { Bell, LayoutDashboard, LogIn, LogOut, Menu, Recycle, Truck, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';

interface NavbarProps {
  onBookNow: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onBookNow }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = () => navigate('/auth');

  const getDashboardPath = () => {
    if (!user) return '/auth';
    const role = (user.role || '').toUpperCase();
    if (role === 'COLLECTOR') return '/collector';
    if (role === 'ADMIN' || role === 'ENTERPRISE') return '/enterprise';
    return '/citizen';
  };

  const goToDashboard = () => {
    navigate(getDashboardPath());
    setIsMobileMenuOpen(false);
  };

  const getDashboardLabel = () => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'COLLECTOR') return 'Dashboard Collector';
    if (role === 'ADMIN') return 'Dashboard Admin';
    if (role === 'ENTERPRISE') return 'Dashboard Enterprise';
    return 'Dashboard Citizen';
  };

  const DashboardIcon = () => {
    const role = (user?.role || '').toUpperCase();
    return role === 'COLLECTOR' ? <Truck size={16} /> : <LayoutDashboard size={16} />;
  };

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
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {/* Go to Dashboard */}
                <button
                  onClick={goToDashboard}
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                  <DashboardIcon />
                  {getDashboardLabel()}
                </button>

                {/* Notifications */}
                <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </button>

                {/* Avatar + Logout */}
                <div className="flex items-center gap-1.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.firstName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-gray-700">
                    {user.firstName}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Đăng xuất"
                  >
                    <LogOut size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={handleLogin}
                  className="px-4 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors border border-brand-200"
                >
                  Đăng Nhập
                </button>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors shadow-sm shadow-brand-500/30"
                >
                  <LogIn size={15} />
                  Đăng Ký
                </button>
              </div>
            )}

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
              {isAuthenticated ? (
                <>
                  {/* Dashboard button in mobile */}
                  <button
                    onClick={goToDashboard}
                    className="w-full py-3 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 flex items-center justify-center gap-2 transition-colors"
                  >
                    <DashboardIcon />
                    {getDashboardLabel()}
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-red-600 font-bold border border-red-200 rounded-xl hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <LogOut size={18} />
                    Đăng Xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-3 text-brand-600 font-bold border border-brand-200 rounded-xl hover:bg-brand-50"
                  >
                    Đăng Nhập
                  </button>
                  <Button
                    onClick={() => {
                      handleLogin();
                      setIsMobileMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Đăng Ký
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
