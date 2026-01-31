import React, { useEffect, useState } from 'react';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Sidebar } from '@shared/components';
import { useNotifications } from '../hooks/useNotifications';
import {
    NotificationForm,
    NotificationTable,
    NotificationFiltersBar,
    KPICards,
    DeleteConfirmDialog,
} from '../components';
import type {
    NotificationFormData,
    NotificationFilters,
    NotificationResponse,
} from '../types';

export const NotificationManagementPage: React.FC = () => {
    const {
        notifications,
        pagination,
        loading,
        error,
        fetchNotifications,
        createNotification,
        updateNotification,
        toggleNotificationStatus,
        deleteNotification,
    } = useNotifications();

    const [filters, setFilters] = useState<NotificationFilters>({ page: 0, size: 10 });
    const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | null>(
        null
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Fetch notifications when filters change
    useEffect(() => {
        fetchNotifications(filters);
    }, [fetchNotifications, filters]);

    // Get current user ID (mock - replace with actual auth context)
    const getCurrentUserId = () => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            return userData.id;
        }
        return '00000000-0000-0000-0000-000000000000'; // Fallback
    };

    // Handlers
    const handleFormSubmit = async (data: NotificationFormData) => {
        try {
            const requestData = {
                title: data.title,
                content: data.content,
                type: data.type,
                targetAudience: data.targetAudience,
                priority: data.priority,
                startDate: data.startDate ? data.startDate.toISOString() : undefined,
                endDate: data.endDate ? data.endDate.toISOString() : undefined,
            };

            if (selectedNotification) {
                // Update existing notification
                await updateNotification(selectedNotification.id, requestData);
            } else {
                // Create new notification
                const adminId = getCurrentUserId();
                await createNotification(adminId, requestData);
            }

            // Refresh list and reset form
            await fetchNotifications(filters);
            setSelectedNotification(null);
        } catch (err) {
            console.error('Form submission error:', err);
        }
    };

    const handleEditClick = (notification: NotificationResponse) => {
        setSelectedNotification(notification);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleNotificationStatus(id);
            await fetchNotifications(filters);
        } catch (err) {
            console.error('Toggle status error:', err);
        }
    };

    const handleDeleteClick = (id: string) => {
        const notification = notifications.find((n) => n.id === id);
        if (notification) {
            setSelectedNotification(notification);
            setIsDeleteDialogOpen(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedNotification) {
            try {
                await deleteNotification(selectedNotification.id);
                setIsDeleteDialogOpen(false);
                setSelectedNotification(null);
                await fetchNotifications(filters);
            } catch (err) {
                console.error('Delete error:', err);
            }
        }
    };

    const handleFilterChange = (newFilters: Partial<NotificationFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
    };

    const handleResetFilters = () => {
        setFilters({ page: 0, size: 10 });
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleFormReset = () => {
        setSelectedNotification(null);
    };

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8">
                    <div className="flex items-center gap-4">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">
                                Notification Management
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 relative">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-[1600px] mx-auto">
                        {/* 2-Column Layout */}
                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                            {/* Left Column - Form (35%) */}
                            <div className="xl:col-span-4">
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <h3 className="text-base font-bold text-gray-900 mb-4">
                                        {selectedNotification ? 'Edit Notification' : 'Create a New Notification'}
                                    </h3>
                                    <NotificationForm
                                        notification={selectedNotification}
                                        onSubmit={handleFormSubmit}
                                        onReset={handleFormReset}
                                    />
                                </div>
                            </div>

                            {/* Right Column - Table (65%) */}
                            <div className="xl:col-span-8 space-y-4">
                                {/* KPI Cards */}
                                <KPICards notifications={notifications} />

                                {/* Filters */}
                                <NotificationFiltersBar
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                    onReset={handleResetFilters}
                                />

                                {/* Table or Loading/Empty State */}
                                {loading ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                                            <div className="space-y-2 w-full max-w-md">
                                                <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
                                                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4 mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
                                        <p className="text-red-600">{error}</p>
                                    </div>
                                ) : (
                                    <>
                                        <NotificationTable
                                            notifications={notifications}
                                            onEdit={handleEditClick}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={handleDeleteClick}
                                        />

                                        {/* Pagination */}
                                        {pagination.totalPages > 1 && (
                                            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                                <div className="text-sm text-gray-600">
                                                    Showing{' '}
                                                    {pagination.currentPage * pagination.pageSize + 1} to{' '}
                                                    {Math.min(
                                                        (pagination.currentPage + 1) * pagination.pageSize,
                                                        pagination.total
                                                    )}{' '}
                                                    of {pagination.total} results
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handlePageChange(pagination.currentPage - 1)
                                                        }
                                                        disabled={pagination.currentPage === 0}
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                                    >
                                                        <ChevronLeft size={16} /> Previous
                                                    </button>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from(
                                                            { length: pagination.totalPages },
                                                            (_, i) => i
                                                        )
                                                            .filter(
                                                                (page) =>
                                                                    page === 0 ||
                                                                    page === pagination.totalPages - 1 ||
                                                                    Math.abs(page - pagination.currentPage) <= 1
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
                                                                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === pagination.currentPage
                                                                            ? 'bg-brand-600 text-white'
                                                                            : 'text-gray-700 hover:bg-gray-100'
                                                                            }`}
                                                                    >
                                                                        {page + 1}
                                                                    </button>
                                                                </React.Fragment>
                                                            ))}
                                                    </div>
                                                    <button
                                                        onClick={() =>
                                                            handlePageChange(pagination.currentPage + 1)
                                                        }
                                                        disabled={
                                                            pagination.currentPage >= pagination.totalPages - 1
                                                        }
                                                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                                    >
                                                        Next <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                notification={selectedNotification}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
};

export default NotificationManagementPage;
