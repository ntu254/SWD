import { useAuth } from '@shared/contexts';
import {
    Award,
    BarChart3,
    ChevronRight,
    ClipboardList,
    LayoutDashboard,
    LogOut,
    MessageSquare,
    Recycle,
    Users,
} from 'lucide-react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
    { href: '/enterprise', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/enterprise/tasks', label: 'Yêu cầu thu gom', icon: ClipboardList },
    { href: '/enterprise/collectors', label: 'Nhân viên thu gom', icon: Users },
    { href: '/enterprise/complaints', label: 'Khiếu nại', icon: MessageSquare },
    { href: '/enterprise/analytics', label: 'Phân tích & Báo cáo', icon: BarChart3 },
    { href: '/enterprise/reward-config', label: 'Cấu hình phần thưởng', icon: Award },
];

export const EnterpriseSidebar: React.FC = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (href: string) =>
        href === '/enterprise'
            ? location.pathname === '/enterprise'
            : location.pathname.startsWith(href);

    return (
        <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col z-10">
            {/* Logo */}
            <div className="p-5 border-b border-gray-100">
                <div
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => navigate('/enterprise')}
                >
                    <div className="bg-emerald-600 p-2 rounded-xl text-white">
                        <Recycle size={20} />
                    </div>
                    <span className="font-display text-xl font-bold text-gray-800">
                        Green<span className="text-emerald-600">Loop</span>
                    </span>
                </div>
            </div>

            {/* User mini-card */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3 bg-emerald-50 rounded-2xl p-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        {user?.firstName?.charAt(0).toUpperCase() || 'E'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <Recycle size={11} />
                            Doanh nghiệp
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(item => {
                    const active = isActive(item.href);
                    return (
                        <button
                            key={item.href}
                            onClick={() => navigate(item.href)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${active
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={18} className={active ? 'text-white' : ''} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {active && <ChevronRight size={14} className="opacity-70" />}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="p-3 border-t border-gray-100">
                <button
                    onClick={() => logout?.()}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </aside>
    );
};

export default EnterpriseSidebar;
