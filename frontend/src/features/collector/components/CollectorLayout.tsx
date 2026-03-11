import { useAuth } from '@shared/contexts';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Recycle,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', href: '/collector', icon: LayoutDashboard },
  { label: 'Nhiệm vụ của tôi', href: '/collector/tasks', icon: ClipboardList },
  { label: 'Bản đồ nhiệm vụ', href: '/collector/map', icon: Map },
  { label: 'Lịch sử công việc', href: '/collector/history', icon: History },
  { label: 'Hiệu suất', href: '/collector/performance', icon: Star },
  { label: 'Hồ sơ', href: '/collector/profile', icon: User },
];

const CollectorLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/collector' ? location.pathname === '/collector' : location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 flex flex-col z-40 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-emerald-600 p-2 rounded-xl text-white">
              <Recycle size={20} />
            </div>
            <span className="font-display text-xl font-bold text-gray-800">
              Green<span className="text-emerald-600">Loop</span>
            </span>
          </div>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User mini-card */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
                <Truck size={11} />
                Nhân viên thu gom
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ label, href, icon: Icon }) => (
            <button
              key={href}
              onClick={() => {
                navigate(href);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${
                  isActive(href)
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {isActive(href) && <ChevronRight size={14} className="opacity-70" />}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-gray-500 hidden sm:block">
              <span className="font-semibold text-gray-800">
                {NAV.find(n => isActive(n.href))?.label ?? 'Collector'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold">
              <Truck size={13} />
              Collector
            </div>
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CollectorLayout;
