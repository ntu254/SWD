import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { Reward, CreateRewardDto, UpdateRewardDto } from '../types';
import { RewardForm } from './RewardForm';

interface RewardModalProps {
  isOpen: boolean;
  reward?: Reward | null;
  onClose: () => void;
  onSubmit: (data: CreateRewardDto | UpdateRewardDto) => Promise<void>;
}

export const RewardModal: React.FC<RewardModalProps> = ({ isOpen, reward, onClose, onSubmit }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {reward ? 'Edit Reward' : 'Create New Reward'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {reward ? 'Update existing reward details below.' : 'Add a new reward to the inventory.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <RewardForm 
            reward={reward} 
            onSubmit={async (data) => {
              await onSubmit(data);
              onClose();
            }} 
            onCancel={onClose} 
          />
        </div>
      </div>
    </div>
  );
};

export default RewardModal;
