import React from 'react';
import { Package, AlertCircle } from 'lucide-react';
import type { AvailableReward } from '../types';
import { RewardCard } from './RewardCard';

interface RewardGridProps {
  rewards: AvailableReward[];
  userPoints: number;
  loading: boolean;
  onExchange: (reward: AvailableReward) => void;
}

export const RewardGrid: React.FC<RewardGridProps> = ({
  rewards,
  userPoints,
  loading,
  onExchange,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200"></div>
            <div className="p-5 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
          <Package size={48} className="text-gray-400" />
        </div>
        <h3 className="font-display text-xl font-bold text-gray-900 mb-2">No Rewards Available</h3>
        <p className="text-gray-600 max-w-md mx-auto">
          There are currently no rewards matching your criteria. Try adjusting your filters or check
          back later.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {rewards.map(reward => (
        <RewardCard
          key={reward.id}
          reward={reward}
          userPoints={userPoints}
          onExchange={onExchange}
        />
      ))}
    </div>
  );
};

export default RewardGrid;
