import React from 'react';
import { Edit2, Ban, RotateCcw, Trash2, MoreVertical } from 'lucide-react';
import type { AdminUserResponse, UserRole, AccountStatus } from '../types';

interface UserTableProps {
    users: AdminUserResponse[];
    onEdit: (user: AdminUserResponse) => void;
    onUpdateStatus: (user: AdminUserResponse) => void;
    onDelete: (id: number) => void;
    onRestore: (id: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    onEdit,
    onUpdateStatus,
    onDelete,
    onRestore,
}) => {
    const getRoleBadgeColor = (role: UserRole) => {
        const colors = {
            ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
            ENTERPRISE: 'bg-blue-100 text-blue-700 border-blue-200',
            CITIZEN: 'bg-green-100 text-green-700 border-green-200',
            COLLECTOR: 'bg-orange-100 text-orange-700 border-orange-200',
        };
        return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const getStatusBadgeColor = (status: AccountStatus) => {
        const colors = {
            ACTIVE: 'bg-green-100 text-green-700 border-green-200',
            DISABLED: 'bg-gray-100 text-gray-700 border-gray-200',
            BANNED: 'bg-red-100 text-red-700 border-red-200',
            PENDING_DELETE: 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                User Code
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Phone
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Created
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className={`hover:bg-gray-50 transition-colors ${user.accountStatus === 'PENDING_DELETE'
                                        ? 'bg-red-50/30'
                                        : ''
                                    }`}
                            >
                                {/* User Info */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-semibold text-sm">
                                            {getInitials(user.firstName, user.lastName)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {user.fullName}
                                            </div>
                                            <div className="text-sm text-gray-500">{user.email}</div>
                                        </div>
                                    </div>
                                </td>

                                {/* User Code */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-mono text-gray-600">
                                        {user.userCode}
                                    </span>
                                </td>

                                {/* Role */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                            user.role
                                        )}`}
                                    >
                                        {user.role}
                                    </span>
                                </td>

                                {/* Phone */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                    {user.phone || '-'}
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <button
                                        onClick={() => onUpdateStatus(user)}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                            user.accountStatus
                                        )} hover:opacity-80 transition-opacity`}
                                    >
                                        {user.accountStatus === 'PENDING_DELETE' && '🗑️ '}
                                        {user.accountStatus === 'BANNED' && '🚫 '}
                                        {user.accountStatus === 'DISABLED' && '⏸ '}
                                        {user.accountStatus === 'ACTIVE' && '✅ '}
                                        {user.accountStatus.replace(/_/g, ' ')}
                                    </button>
                                    {!user.enabled && (
                                        <div className="text-xs text-red-600 mt-1">Disabled</div>
                                    )}
                                    {user.deleteScheduledAt && (
                                        <div className="text-xs text-amber-600 mt-1">
                                            Deletes: {formatDate(user.deleteScheduledAt)}
                                        </div>
                                    )}
                                </td>

                                {/* Created Date */}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(user.createdAt)}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.accountStatus === 'PENDING_DELETE' ? (
                                            <button
                                                onClick={() => onRestore(user.id)}
                                                className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                title="Restore User"
                                            >
                                                <RotateCcw size={16} />
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => onEdit(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Edit User"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onUpdateStatus(user)}
                                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                                                    title="Update Status"
                                                >
                                                    <Ban size={16} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(user.id)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserTable;
