import { useAuth } from '@shared/contexts';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Recycle,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Quản lý người dùng', href: '/admin/users', icon: Users },
  { label: 'Quản lý phần thưởng', href: '/admin/rewards', icon: ClipboardList },
  { label: 'Thông báo', href: '/admin/notifications', icon: Bell },
  { label: 'Khiếu nại', href: '/admin/complaints', icon: MessageSquare },
];

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(href);

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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/admin')}>
            <div className="bg-violet-600 p-2 rounded-xl text-white">
              <Shield size={20} />
            </div>
            <span className="font-display text-xl font-bold text-gray-800">
              Admin<span className="text-violet-600"> Panel</span>
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
          <div className="flex items-center gap-3 bg-violet-50 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1 text-xs text-violet-600 font-semibold">
                <Shield size={11} />
                Administrator
              </div>
            </div>
          </div>
        </div>

        {/* GreenLoop brand */}
        <div className="px-5 pt-4 pb-1">
          <div className="flex items-center gap-1.5">
            <Recycle size={14} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">GreenLoop</span>
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
                    ? 'bg-violet-600 text-white shadow-md shadow-violet-500/30'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {isActive(href) && <ChevronRight size={14} className="opacity-70" />}
            </button>
          ))}
        </nav>

        {/* Settings + Logout */}
        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            to="/admin/settings"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Settings size={18} />
            Cài đặt
          </Link>
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
        <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="text-sm text-gray-500 hidden sm:block">
              <span className="font-semibold text-gray-800">
                {NAV.find(n => isActive(n.href))?.label ?? 'Admin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-violet-50 border border-violet-100 text-violet-700 px-3 py-1.5 rounded-full text-sm font-bold">
              <Shield size={13} />
              Admin
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

export default AdminLayout;
