import React from 'react';
import { RotateCcw } from 'lucide-react';
import type { NotificationFilters, NotificationType, TargetAudience } from '../types';

interface NotificationFiltersProps {
    filters: NotificationFilters;
    onFilterChange: (filters: Partial<NotificationFilters>) => void;
    onReset: () => void;
}

export const NotificationFiltersBar: React.FC<NotificationFiltersProps> = ({
    filters,
    onFilterChange,
    onReset,
}) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Type Filter */}
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                        value={filters.type || ''}
                        onChange={(e) =>
                            onFilterChange({
                                type: e.target.value ? (e.target.value as NotificationType) : undefined,
                            })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    >
                        <option value="">All Types</option>
                        <option value="General">General</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Update">Update</option>
                        <option value="Alert">Alert</option>
                        <option value="Promotion">Promotion</option>
                    </select>
                </div>

                {/* Target Audience Filter */}
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Target Audience
                    </label>
                    <select
                        value={filters.targetAudience || ''}
                        onChange={(e) =>
                            onFilterChange({
                                targetAudience: e.target.value
                                    ? (e.target.value as TargetAudience)
                                    : undefined,
                            })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    >
                        <option value="">All Audiences</option>
                        <option value="All">Everyone</option>
                        <option value="Citizen">Citizen</option>
                        <option value="Collector">Collector</option>
                        <option value="Enterprise">Enterprise</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={
                            filters.isActive === undefined
                                ? ''
                                : filters.isActive
                                    ? 'active'
                                    : 'inactive'
                        }
                        onChange={(e) =>
                            onFilterChange({
                                isActive:
                                    e.target.value === ''
                                        ? undefined
                                        : e.target.value === 'active',
                            })
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                {/* Reset Button */}
                <div className="flex items-end">
                    <button
                        onClick={onReset}
                        className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};
