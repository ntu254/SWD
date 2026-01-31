import { Search, RotateCcw } from 'lucide-react';
import { ComplaintStatus, ComplaintCategory, ComplaintPriority, type ComplaintFilters } from '../types';

interface ComplaintFiltersProps {
    filters: ComplaintFilters;
    onFilterChange: (filters: ComplaintFilters) => void;
}

export function ComplaintFiltersBar({ filters, onFilterChange }: ComplaintFiltersProps) {
    const handleReset = () => {
        onFilterChange({});
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={filters.search || ''}
                            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <select
                    value={filters.status || ''}
                    onChange={(e) =>
                        onFilterChange({
                            ...filters,
                            status: e.target.value as ComplaintStatus | '',
                        })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm min-w-[140px]"
                >
                    <option value="">All Status</option>
                    <option value={ComplaintStatus.PENDING}>Pending</option>
                    <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                    <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                    <option value={ComplaintStatus.REJECTED}>Rejected</option>
                </select>

                {/* Category Filter */}
                <select
                    value={filters.category || ''}
                    onChange={(e) =>
                        onFilterChange({
                            ...filters,
                            category: e.target.value as ComplaintCategory | '',
                        })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm min-w-[140px]"
                >
                    <option value="">All Categories</option>
                    <option value={ComplaintCategory.POINTS_ERROR}>Points Error</option>
                    <option value={ComplaintCategory.BUG}>Bug</option>
                    <option value={ComplaintCategory.SERVICE_ISSUE}>Service Issue</option>
                    <option value={ComplaintCategory.OTHER}>Other</option>
                </select>

                {/* Priority Filter */}
                <select
                    value={filters.priority || ''}
                    onChange={(e) =>
                        onFilterChange({
                            ...filters,
                            priority: e.target.value as ComplaintPriority | '',
                        })
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors text-sm min-w-[140px]"
                >
                    <option value="">All Priorities</option>
                    <option value={ComplaintPriority.LOW}>Low</option>
                    <option value={ComplaintPriority.NORMAL}>Normal</option>
                    <option value={ComplaintPriority.HIGH}>High</option>
                    <option value={ComplaintPriority.URGENT}>Urgent</option>
                </select>

                {/* Reset Button */}
                <button
                    onClick={handleReset}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
                >
                    <RotateCcw size={16} />
                    Reset
                </button>
            </div>
        </div>
    );
}
