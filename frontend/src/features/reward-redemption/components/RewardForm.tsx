import React, { useState, useEffect } from 'react';
import { Upload, X, AlertCircle, Info } from 'lucide-react';
import { DateTimePicker } from '@shared/components';
import type {
  Reward,
  CreateRewardDto,
  UpdateRewardDto,
  RewardCategory,
  RewardStatus,
} from '../types';

interface RewardFormProps {
  reward?: Reward | null;
  onSubmit: (data: CreateRewardDto | UpdateRewardDto) => Promise<void>;
  onCancel: () => void;
}

export const RewardForm: React.FC<RewardFormProps> = ({ reward, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateRewardDto>({
    name: '',
    description: '',
    pointsCost: 0,
    stock: 0,
    imageUrl: '',
    category: 'GIFT' as RewardCategory,
    status: 'ACTIVE' as RewardStatus,
    validFrom: undefined,
    validUntil: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description,
        pointsCost: reward.pointsCost,
        stock: reward.stock,
        imageUrl: reward.imageUrl || '',
        category: reward.category,
        status: reward.status,
        validFrom: reward.validFrom,
        validUntil: reward.validUntil,
      });
    }
  }, [reward]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.description.trim()) newErrors.description = 'Required';
    if (formData.pointsCost <= 0) newErrors.pointsCost = 'Must be > 0';
    if (formData.stock < 0) newErrors.stock = 'Invalid stock';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (reward) {
        await onSubmit({ ...formData, id: reward.id } as UpdateRewardDto);
      } else {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'pointsCost' || name === 'stock' ? Number(value) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Mock Drag & Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    // In a real app, we would process e.dataTransfer.files[0]
    // For now, we'll just mock it or focus the input
    alert('File upload mocked. Please paste a URL for now.');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
              Basic Info
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reward Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    errors.name ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-brand-500'
                  } focus:ring-2 focus:outline-none transition-all`}
                  placeholder="e.g. 50% Off Voucher"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all`}
                  placeholder="Describe the reward..."
                />
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                   <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                   >
                     <option value="VOUCHER">🎫 Voucher</option>
                     <option value="GIFT">🎁 Gift</option>
                     <option value="DISCOUNT">💰 Discount</option>
                     <option value="SERVICE">⚙️ Service</option>
                     <option value="OTHER">📦 Other</option>
                   </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                   <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                   >
                     <option value="ACTIVE">✅ Active</option>
                     <option value="INACTIVE">⏸ Inactive</option>
                     <option value="OUT_OF_STOCK">🚫 Out of Stock</option>
                   </select>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Info (Optional) */}
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
              <Info className="text-blue-500 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-bold text-blue-800">Note</h4>
                <p className="text-xs text-blue-600 mt-1">
                  Changes to stock will immediately affect availability. Users cannot redeem out-of-stock items.
                </p>
              </div>
           </div>
        </div>

        {/* Right Column: Inventory & Media */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
              Inventory & Points
            </h3>
            <div className="grid grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pointsCost"
                      value={formData.pointsCost}
                      onChange={handleChange}
                      className={`w-full pl-3 pr-8 py-2 rounded-lg border bg-white ${
                        errors.pointsCost ? 'border-red-500' : 'border-gray-300'
                      } focus:ring-2 focus:ring-brand-500 outline-none`}
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-xs">PTS</span>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Starting Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                     className={`w-full px-3 py-2 rounded-lg border bg-white ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    } focus:ring-2 focus:ring-brand-500 outline-none`}
                  />
                  {formData.stock === 0 && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle size={12}/> Marked as Out of Stock
                    </p>
                  )}
               </div>
            </div>
          </div>

         

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
              Validity
            </h3>
            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Valid From</label>
                <div className="relative">
                   <DateTimePicker
                    value={formData.validFrom}
                    onChange={(date) => setFormData(prev => ({ ...prev, validFrom: date }))}
                    placeholder="Pick start date"
                    placement="top"
                   />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Valid Until</label>
                <div className="relative">
                   <DateTimePicker
                    value={formData.validUntil}
                    onChange={(date) => setFormData(prev => ({ ...prev, validUntil: date }))}
                    placeholder="Pick end date"
                    placement="top"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-200 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg bg-brand-600 text-white font-medium hover:bg-brand-700 focus:ring-4 focus:ring-brand-100 disabled:opacity-50 transition-all shadow-sm"
        >
          {submitting ? 'Saving...' : reward ? 'Update Reward' : 'Create Reward'}
        </button>
      </div>
    </form>
  );
};

export default RewardForm;
