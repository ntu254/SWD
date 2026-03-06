import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, AlertCircle, WifiOff } from 'lucide-react';
import { Sidebar } from '@shared/components';
import { useRewardExchange } from '../hooks/useRewardExchange';
import { PointsHeader, FiltersBar, RewardGrid, ExchangeDialog } from '../components';
import type { AvailableReward, RewardFilters } from '../types';

/**
 * RewardExchangePage
 * User-facing page for browsing and exchanging rewards
 */
export const RewardExchangePage: React.FC = () => {
  const {
    rewards,
    userPoints,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchRewards,
    fetchUserPoints,
    exchangeReward,
    setCurrentPage,
  } = useRewardExchange();

  const [filters, setFilters] = useState<RewardFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReward, setSelectedReward] = useState<AvailableReward | null>(null);
  const [isExchangeDialogOpen, setIsExchangeDialogOpen] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchUserPoints();
  }, [fetchUserPoints]);

  useEffect(() => {
    fetchRewards(filters, currentPage, 12);
  }, [fetchRewards, filters, currentPage]);

  // Handlers
  const handleExchangeClick = (reward: AvailableReward) => {
    setSelectedReward(reward);
    setIsExchangeDialogOpen(true);
  };

  const handleExchangeConfirm = async (request: any) => {
    await exchangeReward(request);
    setIsExchangeDialogOpen(false);
    setSelectedReward(null);
    // Refresh rewards to update stock
    fetchRewards(filters, currentPage, 12);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefresh = () => {
    fetchRewards(filters, currentPage, 12);
    fetchUserPoints();
  };

  // Error State
  if (error && !loading && rewards.length === 0) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
              <WifiOff size={48} className="text-red-600" />
            </div>
            <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all"
            >
              Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Reward Exchange</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Browse and exchange your GreenLoop points for rewards
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            {/* Points Header */}
            <PointsHeader userPoints={userPoints} loading={!userPoints && loading} />

            {/* Filters */}
            <FiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            {/* Results Info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 font-medium">
                {loading ? (
                  'Loading rewards...'
                ) : (
                  <>
                    Showing <span className="font-bold text-gray-900">{rewards.length}</span> of{' '}
                    <span className="font-bold text-gray-900">{totalElements}</span> rewards
                  </>
                )}
              </p>
            </div>

            {/* Error Banner */}
            {error && rewards.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="text-sm font-bold text-amber-600 hover:text-amber-700"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Rewards Grid */}
            <RewardGrid
              rewards={rewards}
              userPoints={userPoints?.currentPoints || 0}
              loading={loading && rewards.length === 0}
              onExchange={handleExchangeClick}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i;
                    } else if (currentPage < 3) {
                      pageNum = i;
                    } else if (currentPage > totalPages - 3) {
                      pageNum = totalPages - 5 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`
                          min-w-[40px] h-10 px-3 rounded-lg font-bold text-sm
                          transition-all duration-200
                          ${
                            currentPage === pageNum
                              ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Exchange Dialog */}
      {isExchangeDialogOpen && selectedReward && (
        <ExchangeDialog
          reward={selectedReward}
          userPoints={userPoints?.currentPoints || 0}
          onClose={() => {
            setIsExchangeDialogOpen(false);
            setSelectedReward(null);
          }}
          onConfirm={handleExchangeConfirm}
        />
      )}
    </div>
  );
};

export default RewardExchangePage;
