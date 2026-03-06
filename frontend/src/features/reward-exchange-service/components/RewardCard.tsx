import React from 'react';
import { Gift, Ticket, Tag, Wrench, Package, Star, AlertCircle } from 'lucide-react';
import type { AvailableReward } from '../types';

interface RewardCardProps {
  reward: AvailableReward;
  userPoints?: number;
  onExchange: (reward: AvailableReward) => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  VOUCHER: Ticket,
  GIFT: Gift,
  DISCOUNT: Tag,
  SERVICE: Wrench,
  OTHER: Package,
};

const categoryColors: Record<string, { bg: string; text: string; ring: string }> = {
  VOUCHER: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-200' },
  GIFT: { bg: 'bg-pink-50', text: 'text-pink-600', ring: 'ring-pink-200' },
  DISCOUNT: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-200' },
  SERVICE: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-200' },
  OTHER: { bg: 'bg-gray-50', text: 'text-gray-600', ring: 'ring-gray-200' },
};

export const RewardCard: React.FC<RewardCardProps> = ({ reward, userPoints = 0, onExchange }) => {
  const Icon = categoryIcons[reward.category] || Package;
  const colors = categoryColors[reward.category] || categoryColors.OTHER;

  const canAfford = userPoints >= reward.pointsCost;
  const isAvailable = reward.status === 'ACTIVE' && reward.stock > 0;
  const isLowStock = reward.stock > 0 && reward.stock < 10;

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:scale-[1.02] animate-in fade-in zoom-in-95">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        {reward.imageUrl ? (
          <img
            src={reward.imageUrl}
            alt={reward.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={64} className={`${colors.text} opacity-20`} />
          </div>
        )}

        {/* Category Badge */}
        <div
          className={`absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 ${colors.bg} backdrop-blur-md rounded-full shadow-sm ring-1 ${colors.ring}`}
        >
          <Icon size={14} className={colors.text} />
          <span className={`text-xs font-bold ${colors.text}`}>{reward.category}</span>
        </div>

        {/* Stock Warning */}
        {isLowStock && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-amber-500 text-white rounded-full shadow-lg text-xs font-bold">
            <AlertCircle size={12} />
            <span>{reward.stock} left</span>
          </div>
        )}

        {/* Out of Stock */}
        {reward.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white/90 px-4 py-2 rounded-full font-bold text-gray-700">
              Out of Stock
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {reward.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {reward.description}
        </p>

        {/* Points & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5">
            <Star size={18} className="text-accent-500 fill-accent-500" />
            <span className="text-xl font-display font-bold text-gray-900">
              {reward.pointsCost.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 font-semibold">GP</span>
          </div>

          <button
            onClick={() => onExchange(reward)}
            disabled={!canAfford || !isAvailable}
            className={`
              px-5 py-2.5 rounded-xl font-bold text-sm
              transition-all duration-300
              ${
                canAfford && isAvailable
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {!isAvailable ? 'Unavailable' : !canAfford ? 'Not Enough' : 'Exchange'}
          </button>
        </div>

        {/* Insufficient Points Warning */}
        {!canAfford && isAvailable && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertCircle size={14} />
            <span className="font-medium">
              Need {(reward.pointsCost - userPoints).toLocaleString()} more GP
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardCard;
