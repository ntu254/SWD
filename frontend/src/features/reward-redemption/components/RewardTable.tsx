import React, { useState } from 'react';
import { MoreHorizontal, Edit, Trash2, Box, ArrowUpDown } from 'lucide-react';
import type { Reward } from '../types';

interface RewardTableProps {
  rewards: Reward[];
  onEdit: (reward: Reward) => void;
  onDelete: (id: string) => void;
  onUpdateStock: (id: string, stock: number) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}

export const RewardTable: React.FC<RewardTableProps> = ({
  rewards,
  onEdit,
  onDelete,
  onUpdateStock,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700 border-green-200',
      INACTIVE: 'bg-gray-100 text-gray-700 border-gray-200',
      OUT_OF_STOCK: 'bg-red-100 text-red-700 border-red-200',
      EXPIRED: 'bg-amber-100 text-amber-700 border-amber-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.INACTIVE}`}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded">Out of stock</span>;
    if (stock < 10) return <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded">Low: {stock}</span>;
    return <span className="text-gray-700">{stock} in stock</span>;
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
          <tr>
            <th className="p-4 w-4">
              <input
                type="checkbox"
                checked={rewards.length > 0 && selectedIds.length === rewards.length}
                onChange={onToggleSelectAll}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </th>
            <th className="p-4">Reward</th>
            <th className="p-4">Category</th>
            <th className="p-4 cursor-pointer hover:bg-gray-100 group">
              <div className="flex items-center gap-1">
                Points <ArrowUpDown size={14} className="text-gray-400 group-hover:text-gray-600" />
              </div>
            </th>
            <th className="p-4">Stock</th>
            <th className="p-4">Status</th>
            <th className="p-4">Validity</th>
            <th className="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rewards.map((reward) => (
            <tr key={reward.id} className="hover:bg-gray-50 transition-colors group">
              <td className="p-4">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(reward.id)}
                  onChange={() => onToggleSelect(reward.id)}
                  className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                />
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                    {reward.imageUrl ? (
                      <img src={reward.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🎁</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{reward.name}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{reward.description}</div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {reward.category}
                </span>
              </td>
              <td className="p-4">
                <div className="font-semibold text-gray-900">{reward.pointsCost.toLocaleString()}</div>
              </td>
              <td className="p-4">
                {getStockBadge(reward.stock)}
              </td>
              <td className="p-4">
                {getStatusBadge(reward.status)}
              </td>
              <td className="p-4 text-sm">
                {reward.validFrom || reward.validUntil ? (
                  <div className="flex flex-col gap-0.5">
                    {reward.validFrom && (
                      <div className="text-xs text-gray-500">
                        From: {new Date(reward.validFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                    {reward.validUntil && (
                      <div className="text-xs text-gray-700 font-medium">
                        Until: {new Date(reward.validUntil).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400 italic text-xs">No expiry</span>
                )}
              </td>
              <td className="p-4 text-right relative">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(reward);
                    }}
                    className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
                    title="Edit Reward"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newStock = prompt('Enter new stock quantity:', reward.stock.toString());
                      if (newStock !== null && newStock.trim() !== '' && !isNaN(Number(newStock))) {
                        onUpdateStock(reward.id, Number(newStock));
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    title="Update Stock"
                  >
                    <Box size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Are you sure you want to delete "${reward.name}"?\n\nThis action cannot be undone.`)) {
                        onDelete(reward.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                    title="Delete Reward"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardTable;
