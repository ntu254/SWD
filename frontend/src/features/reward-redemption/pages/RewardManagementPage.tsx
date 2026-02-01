import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, Search, Filter, RefreshCw, Download, 
  Bell, ChevronDown, 
  X, AlertTriangle, WifiOff, Package, Tag, Layers
} from 'lucide-react';
import { Sidebar } from '@shared/components';
import { useRewards } from '../hooks/useRewards';
import { RewardTable, RewardModal } from '../components';
import type { Reward, RewardFilters, CreateRewardDto, UpdateRewardDto, RewardCategory, RewardStatus } from '../types';

/**
 * RewardManagementPage
 * Refactored to SaaS Admin Style
 */
export const RewardManagementPage: React.FC = () => {
  const {
    rewards,
    loading,
    error,
    fetchRewards,
    createReward,
    updateReward,
    deleteReward,
    updateStock,
  } = useRewards();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [filters, setFilters] = useState<RewardFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm || undefined }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchRewards(filters);
  }, [fetchRewards, filters]);

  const handleCreateClick = () => {
    setSelectedReward(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: CreateRewardDto | UpdateRewardDto) => {
    if ('id' in data) {
      await updateReward(data as UpdateRewardDto);
    } else {
      await createReward(data as CreateRewardDto);
    }
    // Refresh to ensure Order/Sort
    fetchRewards(filters);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === rewards.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rewards.map(r => r.id));
    }
  };

  // Stats
  const stats = useMemo(() => [
    { label: 'Total Rewards', value: rewards.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active', value: rewards.filter(r => r.status === 'ACTIVE').length, icon: Tag, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Low Stock', value: rewards.filter(r => r.stock < 10).length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Categories', value: new Set(rewards.map(r => r.category)).size, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50' },
  ], [rewards]);

  const activeFilters = [
    filters.category && { label: `Category: ${filters.category}`, key: 'category' },
    filters.status && { label: `Status: ${filters.status}`, key: 'status' },
  ].filter(Boolean) as { label: string, key: keyof RewardFilters }[];

  const removeFilter = (key: keyof RewardFilters) => {
    setFilters(prev => ({ ...prev, [key]: undefined }));
  };

  // Error State Layout
  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full border border-red-100">
  //          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
  //            <WifiOff className="text-red-500" size={32} />
  //          </div>
  //          <h3 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h3>
  //          <p className="text-gray-500 mb-6">We couldn't load the rewards. Please check your internet connection or try again.</p>
  //          <button 
  //           onClick={() => fetchRewards(filters)}
  //           className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium flex items-center justify-center gap-2 mx-auto"
  //          >
  //            <RefreshCw size={18} /> Retry Connection
  //          </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar Mockup */}
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
            <div className="flex items-center gap-4">
               <div>
                  <h1 className="text-lg font-bold text-gray-900">Reward Management</h1>
                  <p className="text-xs text-gray-500">Create and manage loyalty rewards for citizens</p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
               </button>
               <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
           <div className="max-w-6xl mx-auto space-y-8">
              
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                   <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                   <p className="text-gray-500">Track your inventory and reward performance</p>
                </div>
                <div className="flex gap-3">
                   <button className="btn-secondary flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 bg-white">
                      <Download size={18} /> Export
                   </button>
                   <button 
                      onClick={handleCreateClick}
                      className="btn-primary flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm transition-all hover:shadow-md"
                    >
                      <Plus size={18} /> Create Reward
                   </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-xl text-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                       <div className="flex items-center justify-between mb-4">
                          <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                             <stat.icon size={20} />
                          </div>
                      </div>
                      <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                    </div>
                 ))}
              </div>

              {/* Filters Bar */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                 <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full lg:w-96">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <input 
                          type="text" 
                          placeholder="Search rewards by name or description..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                       />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                       <select 
                          value={filters.category || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as RewardCategory || undefined }))}
                          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-50"
                       >
                          <option value="">All Categories</option>
                          <option value="VOUCHER">🎫 Voucher</option>
                          <option value="GIFT">🎁 Gift</option>
                          <option value="DISCOUNT">💰 Discount</option>
                          <option value="SERVICE">⚙️ Service</option>
                          <option value="OTHER">📦 Other</option>
                       </select>

                       <select 
                          value={filters.status || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as RewardStatus || undefined }))}
                          className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-50"
                       >
                          <option value="">All Statuses</option>
                          <option value="ACTIVE">✅ Active</option>
                          <option value="INACTIVE">⏸ Inactive</option>
                          <option value="OUT_OF_STOCK">🚫 Out of Stock</option>
                       </select>

                       <button 
                          onClick={() => { setFilters({}); setSearchTerm(''); }}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Reset Filters"
                       >
                          <RefreshCw size={18} />
                       </button>
                    </div>
                 </div>

                 {/* Active Chips */}
                 {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">Active Filters:</span>
                       {activeFilters.map((f) => (
                          <div key={f.key} className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100">
                             {f.label}
                             <button onClick={() => removeFilter(f.key)} className="hover:text-brand-900"><X size={12} /></button>
                          </div>
                       ))}
                       <button onClick={() => { setFilters({}); setSearchTerm(''); }} className="text-xs text-gray-500 hover:text-brand-600 underline ml-2">Clear all</button>
                    </div>
                 )}
              </div>

              {/* Table Content */}
              {loading ? (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                     <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                        <div className="space-y-2 w-full max-w-md">
                           <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                           <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
                        </div>
                     </div>
                 </div>
              ) : rewards.length === 0 ? (
                 <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Package className="text-gray-300" size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Rewards Found</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                       {filters.search || filters.category || filters.status 
                          ? "We couldn't find any rewards matching your filters. Try adjusting them."
                          : "Get started by creating your first reward for citizens to redeem."}
                    </p>
                    <button 
                       onClick={handleCreateClick}
                       className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium inline-flex items-center gap-2"
                    >
                       <Plus size={18} /> Create New Reward
                    </button>
                 </div>
              ) : (
                <>
                  {/* Bulk Actions Bar */}
                  {selectedIds.length > 0 && (
                    <div className="bg-brand-50 border border-brand-100 rounded-lg p-3 flex items-center justify-between mb-4 animate-fade-in-up">
                       <span className="text-sm font-medium text-brand-800 flex items-center gap-2">
                          <span className="w-6 h-6 bg-brand-200 rounded-full flex items-center justify-center text-xs">{selectedIds.length}</span>
                          selected
                       </span>
                       <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 hover:text-brand-700 hover:border-brand-300 transition-colors">
                             Deactivate
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-gray-200 rounded text-sm font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors">
                             Delete
                          </button>
                       </div>
                    </div>
                  )}

                  <RewardTable 
                    rewards={rewards}
                    onEdit={handleEditClick}
                    onDelete={deleteReward}
                    onUpdateStock={updateStock}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                  />
                  
                  <div className="text-center mt-6 text-xs text-gray-400">
                     Showing {rewards.length} results
                  </div>
                </>
              )}
           </div>
        </div>
      </main>

      <RewardModal
        isOpen={isModalOpen}
        reward={selectedReward}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default RewardManagementPage;
