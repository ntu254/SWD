import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import type { RewardFilters } from '../types';

interface FiltersBarProps {
  filters: RewardFilters;
  onFiltersChange: (filters: RewardFilters) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'VOUCHER', label: 'Vouchers' },
  { value: 'GIFT', label: 'Gifts' },
  { value: 'DISCOUNT', label: 'Discounts' },
  { value: 'SERVICE', label: 'Services' },
  { value: 'OTHER', label: 'Other' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'pointsCost-asc', label: 'Low to High Points' },
  { value: 'pointsCost-desc', label: 'High to Low Points' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
];

export const FiltersBar: React.FC<FiltersBarProps> = ({
  filters,
  onFiltersChange,
  searchTerm,
  onSearchChange,
}) => {
  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category: category || undefined });
  };

  const handleSortChange = (sortValue: string) => {
    if (!sortValue) {
      onFiltersChange({ ...filters, sortBy: undefined, sortOrder: undefined });
      return;
    }
    const [sortBy, sortOrder] = sortValue.split('-') as [any, 'asc' | 'desc'];
    onFiltersChange({ ...filters, sortBy, sortOrder });
  };

  const clearFilters = () => {
    onFiltersChange({});
    onSearchChange('');
  };

  const hasActiveFilters = filters.category || filters.sortBy || searchTerm;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="
              w-full pl-10 pr-4 py-3 
              bg-gray-50 border border-gray-200 rounded-xl
              font-medium text-gray-800
              focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none
              transition-all duration-200
              placeholder:text-gray-400
            "
          />
        </div>

        {/* Category Filter */}
        <div className="relative group">
          <Filter
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none"
            size={18}
          />
          <select
            value={filters.category || ''}
            onChange={e => handleCategoryChange(e.target.value)}
            className="
              w-full lg:w-48 pl-10 pr-10 py-3 
              bg-gray-50 border border-gray-200 rounded-xl
              font-medium text-gray-800
              focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none
              transition-all duration-200
              appearance-none cursor-pointer
            "
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="relative group">
          <SlidersHorizontal
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-500 transition-colors pointer-events-none"
            size={18}
          />
          <select
            value={
              filters.sortBy && filters.sortOrder ? `${filters.sortBy}-${filters.sortOrder}` : ''
            }
            onChange={e => handleSortChange(e.target.value)}
            className="
              w-full lg:w-56 pl-10 pr-10 py-3 
              bg-gray-50 border border-gray-200 rounded-xl
              font-medium text-gray-800
              focus:bg-white focus:border-brand-500 focus:ring-[3px] focus:ring-brand-500/10 focus:outline-none
              transition-all duration-200
              appearance-none cursor-pointer
            "
          >
            <option value="">Default Sort</option>
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="
              px-4 py-3 rounded-xl font-medium
              bg-gray-100 text-gray-700
              hover:bg-gray-200 hover:text-gray-900
              transition-colors duration-200
              flex items-center gap-2
            "
          >
            <X size={18} />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FiltersBar;
