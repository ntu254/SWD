import React from 'react';
import { LayoutDashboard, Gift, History, Settings } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">SWD</div>
          <span className="font-bold text-xl text-gray-900">Admin</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        <a href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <LayoutDashboard size={20} /> Dashboard
        </a>
        <a href="/admin/rewards" className="flex items-center gap-3 px-3 py-2.5 bg-brand-50 text-brand-700 font-medium rounded-lg transition-colors">
          <Gift size={20} /> Rewards
        </a>
        <a href="/admin/redemptions" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <History size={20} /> Redemptions
        </a>
        <a href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <Settings size={20} /> Settings
        </a>
      </nav>

      {/* <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl p-4 text-white">
          <p className="text-sm font-medium opacity-90">Need Help?</p>
          <p className="text-xs opacity-75 mt-1">Check our documentation for guide.</p>
        </div>
      </div> */}
    </aside>
  );
};

export default Sidebar;
