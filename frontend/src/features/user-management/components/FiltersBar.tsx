import React from 'react';
import { Search, RefreshCw, X } from 'lucide-react';
import type { UserFilters, UserRole, AccountStatus } from '../types';

interface FiltersBarProps {
    filters: UserFilters;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onFilterChange: (filters: Partial<UserFilters>) => void;
    onReset: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
    filters,
    searchTerm,
    onSearchChange,
    onFilterChange,
    onReset,
}) => {
    const activeFilters = [
        filters.role && { label: `Role: ${filters.role}`, key: 'role' as const },
        filters.status && { label: `Status: ${filters.status}`, key: 'status' as const },
        filters.enabled !== undefined && {
            label: `Enabled: ${filters.enabled ? 'Yes' : 'No'}`,
            key: 'enabled' as const,
        },
    ].filter(Boolean) as { label: string; key: keyof UserFilters }[];

    const removeFilter = (key: keyof UserFilters) => {
        onFilterChange({ [key]: undefined });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <div className="relative w-full lg:w-96">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="Search by name, email, or user code..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                    />
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Role Filter */}
                    <select
                        value={filters.role || ''}
                        onChange={(e) =>
                            onFilterChange({
                                role: (e.target.value as UserRole) || undefined,
                            })
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-50"
                    >
                        <option value="">All Roles</option>
                        <option value="ADMIN">👑 Admin</option>
                        <option value="ENTERPRISE">🏭 Enterprise</option>
                        <option value="CITIZEN">👤 Citizen</option>
                        <option value="COLLECTOR">🚚 Collector</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status || ''}
                        onChange={(e) =>
                            onFilterChange({
                                status: (e.target.value as AccountStatus) || undefined,
                            })
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-50"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">✅ Active</option>
                        <option value="DISABLED">⏸ Disabled</option>
                        <option value="BANNED">🚫 Banned</option>
                        <option value="PENDING_DELETE">🗑️ Pending Delete</option>
                    </select>

                    {/* Enabled Filter */}
                    <select
                        value={
                            filters.enabled === undefined ? '' : filters.enabled ? 'true' : 'false'
                        }
                        onChange={(e) =>
                            onFilterChange({
                                enabled:
                                    e.target.value === ''
                                        ? undefined
                                        : e.target.value === 'true',
                            })
                        }
                        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:ring-2 focus:ring-brand-500 outline-none cursor-pointer hover:bg-gray-50"
                    >
                        <option value="">All States</option>
                        <option value="true">Enabled</option>
                        <option value="false">Disabled</option>
                    </select>

                    {/* Reset Button */}
                    <button
                        onClick={onReset}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Reset Filters"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider py-1">
                        Active Filters:
                    </span>
                    {activeFilters.map((f) => (
                        <div
                            key={f.key}
                            className="flex items-center gap-1.5 px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium border border-brand-100"
                        >
                            {f.label}
                            <button onClick={() => removeFilter(f.key)} className="hover:text-brand-900">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                    <button
                        onClick={onReset}
                        className="text-xs text-gray-500 hover:text-brand-600 underline ml-2"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
};

export default FiltersBar;
