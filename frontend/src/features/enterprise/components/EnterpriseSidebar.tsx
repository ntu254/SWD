import React from 'react';
import { useAuth } from '@shared/contexts';
import {
    LayoutDashboard,
    ClipboardList,
    Users,
    MessageSquare,
    BarChart3,
    Award,
    Settings,
    LogOut,
    Recycle,
} from 'lucide-react';

const NAV_ITEMS = [
    { href: '/enterprise', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/enterprise/tasks', label: 'Collection Requests', icon: ClipboardList },
    { href: '/enterprise/collectors', label: 'Collectors', icon: Users },
    { href: '/enterprise/complaints', label: 'Complaints', icon: MessageSquare },
    { href: '/enterprise/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/enterprise/reward-config', label: 'Reward Config', icon: Award },
];

export const EnterpriseSidebar: React.FC = () => {
    const { logout } = useAuth();
    const currentPath = window.location.pathname;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col z-10">
            {/* Logo */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
                        <Recycle size={22} className="text-white" />
                    </div>
                    <div>
                        <span className="font-bold text-lg text-gray-900">Enterprise</span>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Dashboard</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                <p className="px-3 mb-3 text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Main Menu</p>
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath === item.href;
                    return (
                        <a
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} className={isActive ? 'text-emerald-600' : ''} />
                            {item.label}
                        </a>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 space-y-1">
                <a
                    href="/enterprise/settings"
                    className="flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg text-sm transition-colors"
                >
                    <Settings size={20} />
                    Settings
                </a>
                <button
                    onClick={() => logout?.()}
                    className="flex items-center gap-3 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-lg text-sm w-full transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default EnterpriseSidebar;
