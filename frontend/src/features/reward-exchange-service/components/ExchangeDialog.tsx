import React, { useState } from 'react';
import { X, Gift, MapPin, MessageSquare, Star, Loader2, CheckCircle } from 'lucide-react';
import type { AvailableReward, ExchangeRequest } from '../types';

interface ExchangeDialogProps {
  reward: AvailableReward | null;
  userPoints: number;
  onClose: () => void;
  onConfirm: (request: ExchangeRequest) => Promise<void>;
}

export const ExchangeDialog: React.FC<ExchangeDialogProps> = ({
  reward,
  userPoints,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!reward) return null;

  const totalCost = reward.pointsCost * quantity;
  const remainingPoints = userPoints - totalCost;
  const canAfford = remainingPoints >= 0;
  const maxQuantity = Math.min(reward.stock, Math.floor(userPoints / reward.pointsCost));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAfford || loading) return;

    try {
      setLoading(true);
      await onConfirm({
        rewardId: reward.id,
        quantity,
        deliveryAddress: deliveryAddress.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Exchange error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-6 py-5 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl">
              <Gift size={24} />
            </div>
            <h2 className="font-display text-xl font-bold">Exchange Reward</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center animate-in zoom-in-95 fade-in duration-300">
              <div className="inline-flex p-4 bg-green-100 rounded-full mb-4">
                <CheckCircle size={48} className="text-green-600" />
              </div>
              <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                Exchange Successful!
              </h3>
              <p className="text-gray-600">Your request has been submitted</p>
            </div>
          </div>
        )}

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-80px)]"
        >
          {/* Reward Info */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex gap-4">
              {reward.imageUrl ? (
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-brand-100 to-brand-200 rounded-lg flex items-center justify-center">
                  <Gift size={32} className="text-brand-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{reward.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{reward.description}</p>
              </div>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">Quantity</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={e =>
                  setQuantity(Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1)))
                }
                min="1"
                max={maxQuantity}
                className="flex-1 text-center py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-900 focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Available: {reward.stock} | Max you can get: {maxQuantity}
            </p>
          </div>

          {/* Delivery Address (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Delivery Address <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 ml-1">
              Notes <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3.5 top-3.5 text-gray-400" size={18} />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special requests?"
                rows={3}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-800 focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none transition-all placeholder:text-gray-400 resize-none"
              />
            </div>
          </div>

          {/* Points Summary */}
          <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-4 border border-brand-200">
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Current Points</span>
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-accent-500 fill-accent-500" />
                  <span className="font-bold text-gray-900">{userPoints.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Cost ({quantity}x)</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-red-600">-{totalCost.toLocaleString()}</span>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900">Remaining Points</span>
                <div className="flex items-center gap-1.5">
                  <Star
                    size={18}
                    className={`${canAfford ? 'text-green-600 fill-green-600' : 'text-red-600 fill-red-600'}`}
                  />
                  <span
                    className={`font-display text-xl font-bold ${canAfford ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {remainingPoints.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          {!canAfford && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <Star size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">
                Insufficient points. You need {Math.abs(remainingPoints).toLocaleString()} more GP.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-6 rounded-xl font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canAfford || loading}
              className={`
                flex-1 py-3 px-6 rounded-xl font-bold
                flex items-center justify-center gap-2
                transition-all duration-300
                ${
                  canAfford && !loading
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 hover:scale-[1.02]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Gift size={20} />
                  Confirm Exchange
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExchangeDialog;
