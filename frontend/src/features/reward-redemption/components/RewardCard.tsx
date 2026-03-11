import React from 'react';
import type { Reward } from '../types';

interface RewardCardProps {
  reward: Reward;
  onEdit: (reward: Reward) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, stock: number) => void;
}

/**
 * RewardCard Component
 * Displays a single reward with actions (Edit, Delete, Update Stock)
 * Following UI/UX guidelines: Light theme, shadow-xl for depth, accent-500 for rewards
 */
export const RewardCard: React.FC<RewardCardProps> = ({
  reward,
  onEdit,
  onDelete,
  onUpdateStock,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VOUCHER':
        return '🎫';
      case 'GIFT':
        return '🎁';
      case 'DISCOUNT':
        return '💰';
      case 'SERVICE':
        return '⚙️';
      default:
        return '📦';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 border border-gray-100">
      {/* Image */}
      {reward.imageUrl && (
        <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
          <img src={reward.imageUrl} alt={reward.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 right-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reward.status)}`}
            >
              {reward.status}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getCategoryIcon(reward.category)}</span>
            <h3 className="text-lg font-bold text-gray-900">{reward.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{reward.description}</p>
        </div>
      </div>

      {/* Points and Stock */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-r from-accent-50 to-accent-100 p-3 rounded-lg">
          <p className="text-xs text-accent-700 font-semibold mb-1">Points Cost</p>
          <p className="text-2xl font-bold text-accent-600">{reward.pointsCost}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
          <p className="text-xs text-blue-700 font-semibold mb-1">Stock</p>
          <p className="text-2xl font-bold text-blue-600">{reward.stock}</p>
        </div>
      </div>

      {/* Validity */}
      {(reward.validFrom || reward.validUntil) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">⏰ Validity Period</p>
          <div className="flex gap-2 text-xs text-gray-700">
            {reward.validFrom && (
              <span>From: {new Date(reward.validFrom).toLocaleDateString()}</span>
            )}
            {reward.validUntil && (
              <span>To: {new Date(reward.validUntil).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(reward)}
          className="flex-1 px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors text-sm font-semibold"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => {
            const newStock = prompt('Enter new stock:', reward.stock.toString());
            if (newStock && !isNaN(Number(newStock))) {
              onUpdateStock(reward.id, Number(newStock));
            }
          }}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
        >
          📦 Stock
        </button>
        <button
          onClick={() => {
            if (confirm(`Are you sure you want to delete "${reward.name}"?`)) {
              onDelete(reward.id);
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
        >
          🗑️
        </button>
      </div>

      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-500">
        <span>Created: {new Date(reward.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(reward.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default RewardCard;
