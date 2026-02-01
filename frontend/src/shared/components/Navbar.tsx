import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@utils/constants';
import { useAuth } from '@shared/contexts/AuthContext';
import Button from './Button';
import { Menu, X, Recycle, UserPlus, LogIn, Bell, Leaf, User as UserIcon, LogOut } from 'lucide-react';

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

    const handleLogin = () => {
        navigate('/auth');
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
            }`}>
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
                        {NAV_ITEMS.map((item) => (
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
                            <div className="flex items-center gap-2 sm:gap-4">
                                {/* Notifications */}
                                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                                    <Bell size={20} />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                                </button>

                                {/* Points Badge */}
                                <div className="hidden sm:flex items-center px-3 py-1.5 bg-green-50 text-brand-700 rounded-full font-bold text-sm border border-brand-200">
                                    <Leaf size={14} className="mr-1.5 fill-brand-700" />
                                    <span>2,450 GP</span>
                                </div>

                                {/* User Profile */}
                                <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-2">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold shadow-md border-2 border-white ring-2 ring-brand-100">
                                        {user.firstName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-sm font-bold text-gray-700 leading-none">{user.firstName} {user.lastName}</p>
                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider mt-0.5">{user.role || 'MEMBER'}</p>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="hidden md:flex p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg ml-1 transition-colors"
                                        title="Đăng xuất"
                                    >
                                        <LogOut size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleLogin}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-brand-600 font-bold hover:bg-brand-50 rounded-full transition-colors border-2 border-brand-400"
                                >
                                    <LogIn size={18} />
                                    Đăng Nhập
                                </button>
                                <Button onClick={handleLogin} variant="primary" size="sm" className="hidden md:inline-flex group shadow-brand-500/20 border-2 border-brand-400">
                                    <UserPlus size={18} className="mr-2" />
                                    Đăng Ký
                                </Button>
                            </>
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
                <div className={`lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                    <div className="flex flex-col p-4 space-y-4">
                        {NAV_ITEMS.map((item) => (
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
                                    <Button onClick={() => {
                                        handleLogin();
                                        setIsMobileMenuOpen(false);
                                    }} fullWidth>
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
