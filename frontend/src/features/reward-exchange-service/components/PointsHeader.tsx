import React from 'react';
import { Star, TrendingUp, Gift, Zap } from 'lucide-react';
import type { UserPointsInfo } from '../types';

interface PointsHeaderProps {
  userPoints: UserPointsInfo | null;
  loading?: boolean;
}

export const PointsHeader: React.FC<PointsHeaderProps> = ({ userPoints, loading }) => {
  if (loading || !userPoints) {
    return (
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
        <div className="h-16 bg-white/20 rounded w-32"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Current Points',
      value: userPoints.currentPoints.toLocaleString(),
      icon: Star,
      gradient: 'from-accent-500 to-amber-600',
    },
    {
      label: 'Total Earned',
      value: userPoints.totalEarned.toLocaleString(),
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Total Spent',
      value: userPoints.totalSpent.toLocaleString(),
      icon: Gift,
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700 rounded-2xl shadow-xl overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="relative p-6 lg:p-8">
        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
            <Zap size={28} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-white">
              GreenLoop Points
            </h2>
            <p className="text-white/80 text-sm font-medium">
              Earn points by recycling, exchange for rewards
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/10 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 bg-gradient-to-br ${stat.gradient} rounded-lg shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                </div>
                <div className="font-display text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70 text-sm font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PointsHeader;
