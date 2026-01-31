import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '@shared/components';
import { useComplaints } from '../hooks/useComplaints';
import {
    StatisticsCards,
    ComplaintFiltersBar,
    ComplaintList,
    ComplaintDetail,
} from '../components';
import { ComplaintStatus } from '../types';

export function ComplaintManagementPage() {
    const {
        complaints,
        selectedComplaint,
        setSelectedComplaint,
        statistics,
        filters,
        setFilters,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalPages,
        totalElements,
        updateStatus,
        deleteComplaint,
        refetch,
    } = useComplaints();

    // Get current user ID from localStorage
    const getCurrentUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                return user.id || 'admin';
            } catch {
                return 'admin';
            }
        }
        return 'admin';
    };

    const handleUpdateStatus = async (id: string, status: ComplaintStatus, adminResponse: string) => {
        const resolvedById = getCurrentUserId();
        await updateStatus(id, { status, adminResponse, resolvedById });
    };

    const handleDelete = async (id: string) => {
        await deleteComplaint(id);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleSelectComplaint = (complaint: any) => {
        setSelectedComplaint(complaint);
        // Scroll to top to see the form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFormReset = () => {
        setSelectedComplaint(null);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">Complaint Management</h1>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 p-6 min-h-0">
                    <div className="max-w-[1600px] mx-auto h-full">
                        {/* 2-Column Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-full">
                            {/* Left Column - Detail Form (35%) */}
                            <div className="xl:col-span-4 flex flex-col h-full">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full overflow-hidden">
                                    <h3 className="text-base font-bold text-gray-900 mb-4 flex-shrink-0">
                                        {selectedComplaint ? 'Complaint Details' : 'Select a Complaint'}
                                    </h3>
                                    <ComplaintDetail
                                        complaint={selectedComplaint}
                                        onUpdateStatus={handleUpdateStatus}
                                        onDelete={handleDelete}
                                    />
                                    {selectedComplaint && (
                                        <button
                                            onClick={handleFormReset}
                                            className="mt-4 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex-shrink-0"
                                        >
                                            Clear Selection
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - List (65%) */}
                            <div className="xl:col-span-8 flex flex-col gap-4 h-full min-h-0">
                                {/* KPI Cards */}
                                <div className="flex-shrink-0">
                                    <StatisticsCards statistics={statistics} />
                                </div>

                                {/* Filters */}
                                <div className="flex-shrink-0">
                                    <ComplaintFiltersBar filters={filters} onFilterChange={setFilters} />
                                </div>

                                {/* Error State */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex-shrink-0">
                                        {error}
                                    </div>
                                )}

                                {/* Complaint List */}
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-1 flex flex-col overflow-hidden min-h-0">
                                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                        <h3 className="text-base font-bold text-gray-900">
                                            Complaints ({totalElements})
                                        </h3>
                                        <button
                                            onClick={handleFormReset}
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>

                                    {/* Scrollable List */}
                                    <div className="flex-1 overflow-y-auto">
                                        <ComplaintList
                                            complaints={complaints}
                                            selectedComplaint={selectedComplaint}
                                            onSelectComplaint={handleSelectComplaint}
                                            loading={loading}
                                        />
                                    </div>

                                    {/* Pagination - Always visible at bottom */}
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t flex-shrink-0">
                                        <div className="text-sm text-gray-600">
                                            Showing {currentPage * 3 + 1} to{' '}
                                            {Math.min((currentPage + 1) * 3, totalElements)} of{' '}
                                            {totalElements} results
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 0}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                            >
                                                <ChevronLeft size={16} /> Previous
                                            </button>
                                            <div className="flex items-center gap-1">
                                                {Array.from(
                                                    { length: totalPages || 1 },
                                                    (_, i) => i
                                                )
                                                    .filter(
                                                        (page) =>
                                                            page === 0 ||
                                                            page === (totalPages || 1) - 1 ||
                                                            Math.abs(page - currentPage) <= 1
                                                    )
                                                    .map((page, idx, arr) => (
                                                        <React.Fragment key={page}>
                                                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                                <span className="px-2 text-gray-400">
                                                                    ...
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => handlePageChange(page)}
                                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === currentPage
                                                                    ? 'bg-brand-600 text-white shadow-sm'
                                                                    : 'text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {page + 1}
                                                            </button>
                                                        </React.Fragment>
                                                    ))}
                                            </div>
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage >= totalPages - 1}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                            >
                                                Next <ChevronRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
