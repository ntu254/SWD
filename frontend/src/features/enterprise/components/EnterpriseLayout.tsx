import React from 'react';
import { Bell } from 'lucide-react';
import { EnterpriseSidebar } from './EnterpriseSidebar';

interface EnterpriseLayoutProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({
    title,
    subtitle,
    children,
    actions,
}) => {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            <EnterpriseSidebar />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shrink-0">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{title}</h1>
                        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                        {actions}
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            E
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">{children}</div>
                </div>
            </main>
        </div>
    );
};

export default EnterpriseLayout;
