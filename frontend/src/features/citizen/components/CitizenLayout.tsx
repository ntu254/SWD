import { useAuth } from '@shared/contexts';
import { citizenRewardService } from '@shared/services/api';
import {
  Bell,
  Camera,
  ChevronRight,
  FileText,
  Gift,
  LayoutDashboard,
  Leaf,
  LogOut,
  Map,
  Menu,
  MessageSquare,
  Recycle,
  User,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const NAV = [
  { label: 'Dashboard', href: '/citizen', icon: LayoutDashboard },
  { label: 'Báo cáo rác', href: '/citizen/report', icon: Camera },
  { label: 'Báo cáo của tôi', href: '/citizen/my-reports', icon: FileText },
  { label: 'Bản đồ rác', href: '/citizen/map', icon: Map },
  { label: 'Phần thưởng', href: '/citizen/rewards', icon: Gift },
  { label: 'Khiếu nại', href: '/citizen/complaints', icon: MessageSquare },
  { label: 'Hồ sơ', href: '/citizen/profile', icon: User },
];

const CitizenLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    citizenRewardService.getMyPoints().then(setPoints).catch(() => {});
  }, []);

  const isActive = (href: string) =>
    href === '/citizen' ? location.pathname === '/citizen' : location.pathname.startsWith(href);

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
            <div className="bg-brand-500 p-2 rounded-xl text-white">
              <Recycle size={20} />
            </div>
            <span className="font-display text-xl font-bold text-gray-800">
              Green<span className="text-brand-500">Loop</span>
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
          <div className="flex items-center gap-3 bg-brand-50 rounded-2xl p-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                <Leaf size={11} className="fill-brand-500 text-brand-500" />
                {points !== null ? `${points.toLocaleString('vi-VN')} GP` : '…'}
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
                ${
                  isActive(href)
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
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
                {NAV.find(n => isActive(n.href))?.label ?? 'Citizen'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real Points from API */}
            <div className="hidden sm:flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-700 px-3 py-1.5 rounded-full text-sm font-bold">
              <Leaf size={13} className="fill-brand-600 text-brand-600" />
              {points !== null ? `${points.toLocaleString('vi-VN')} GP` : '…'}
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

export default CitizenLayout;
