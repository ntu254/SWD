import React, { useEffect, useState } from 'react';
import { Plus, Bell, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Sidebar } from '@shared/components';
import { useUsers } from '../hooks/useUsers';
import {
    KPICards,
    FiltersBar,
    UserTable,
    UserFormDialog,
    StatusUpdateDialog,
    DeleteConfirmDialog,
} from '../components';
import type {
    AdminUserResponse,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserStatusRequest,
    UserFilters,
} from '../types';

export const UserManagementPage: React.FC = () => {
    const {
        users,
        pagination,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        updateUserStatus,
        deleteUser,
        restoreUser,
    } = useUsers();

    const [filters, setFilters] = useState<UserFilters>({ page: 0, size: 10 });
    const [searchTerm, setSearchTerm] = useState('');
    const [isUserFormOpen, setIsUserFormOpen] = useState(false);
    const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<AdminUserResponse | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters((prev) => ({ ...prev, q: searchTerm || undefined, page: 0 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch users when filters change
    useEffect(() => {
        fetchUsers(filters);
    }, [fetchUsers, filters]);

    // Handlers
    const handleCreateClick = () => {
        setSelectedUser(null);
        setIsUserFormOpen(true);
    };

    const handleEditClick = (user: AdminUserResponse) => {
        setSelectedUser(user);
        setIsUserFormOpen(true);
    };

    const handleStatusClick = (user: AdminUserResponse) => {
        setSelectedUser(user);
        setIsStatusDialogOpen(true);
    };

    const handleDeleteClick = (user: AdminUserResponse) => {
        setSelectedUser(user);
        setIsDeleteDialogOpen(true);
    };

    const handleRestoreClick = async (id: number) => {
        try {
            await restoreUser(id);
            await fetchUsers(filters);
        } catch (err) {
            console.error('Restore error:', err);
        }
    };

    const handleUserFormSubmit = async (data: CreateUserRequest | UpdateUserRequest) => {
        if (selectedUser) {
            await updateUser(selectedUser.id, data as UpdateUserRequest);
        } else {
            await createUser(data as CreateUserRequest);
        }
        await fetchUsers(filters);
    };

    const handleStatusUpdate = async (data: UpdateUserStatusRequest) => {
        if (selectedUser) {
            await updateUserStatus(selectedUser.id, data);
            await fetchUsers(filters);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedUser) {
            await deleteUser(selectedUser.id);
            setIsDeleteDialogOpen(false);
            await fetchUsers(filters);
        }
    };

    const handleFilterChange = (newFilters: Partial<UserFilters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters, page: 0 }));
    };

    const handleResetFilters = () => {
        setFilters({ page: 0, size: 10 });
        setSearchTerm('');
    };

    const handlePageChange = (newPage: number) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
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
                            <h1 className="text-lg font-bold text-gray-900">User Management</h1>
                            <p className="text-xs text-gray-500">
                                Manage system users and their permissions
                            </p>
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
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Page Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
                                <p className="text-gray-500">Monitor user accounts and activity</p>
                            </div>
                            <button
                                onClick={handleCreateClick}
                                className="btn-primary flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 shadow-sm transition-all hover:shadow-md"
                            >
                                <Plus size={18} /> Create User
                            </button>
                        </div>

                        {/* KPI Cards */}
                        <KPICards users={users} />

                        {/* Filters */}
                        <FiltersBar
                            filters={filters}
                            searchTerm={searchTerm}
                            onSearchChange={setSearchTerm}
                            onFilterChange={handleFilterChange}
                            onReset={handleResetFilters}
                        />

                        {/* Table or Empty/Loading State */}
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
                        ) : users.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Package className="text-gray-300" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    No Users Found
                                </h3>
                                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                    {filters.q || filters.role || filters.status || filters.enabled !== undefined
                                        ? "We couldn't find any users matching your filters. Try adjusting them."
                                        : 'Get started by creating your first user account.'}
                                </p>
                                <button
                                    onClick={handleCreateClick}
                                    className="px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium inline-flex items-center gap-2"
                                >
                                    <Plus size={18} /> Create New User
                                </button>
                            </div>
                        ) : (
                            <>
                                <UserTable
                                    users={users}
                                    onEdit={handleEditClick}
                                    onUpdateStatus={handleStatusClick}
                                    onDelete={(id) =>
                                        handleDeleteClick(users.find((u) => u.id === id)!)
                                    }
                                    onRestore={handleRestoreClick}
                                />

                                {/* Pagination */}
                                <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                                    <div className="text-sm text-gray-600">
                                        Showing {pagination.currentPage * pagination.pageSize + 1} to{' '}
                                        {Math.min(
                                            (pagination.currentPage + 1) * pagination.pageSize,
                                            pagination.total
                                        )}{' '}
                                        of {pagination.total} results
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={pagination.currentPage === 0}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            <ChevronLeft size={16} /> Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: pagination.totalPages }, (_, i) => i)
                                                .filter(
                                                    (page) =>
                                                        page === 0 ||
                                                        page === pagination.totalPages - 1 ||
                                                        Math.abs(page - pagination.currentPage) <= 1
                                                )
                                                .map((page, idx, arr) => (
                                                    <React.Fragment key={page}>
                                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                            <span className="px-2 text-gray-400">...</span>
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
                                                ))}{' '}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={pagination.currentPage >= pagination.totalPages - 1}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Dialogs */}
            <UserFormDialog
                isOpen={isUserFormOpen}
                user={selectedUser}
                onClose={() => setIsUserFormOpen(false)}
                onSubmit={handleUserFormSubmit}
            />
            <StatusUpdateDialog
                isOpen={isStatusDialogOpen}
                user={selectedUser}
                onClose={() => setIsStatusDialogOpen(false)}
                onSubmit={handleStatusUpdate}
            />
            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                user={selectedUser}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
};

export default UserManagementPage;
