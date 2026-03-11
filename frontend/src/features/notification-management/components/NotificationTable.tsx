import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import type { NotificationResponse } from '../types';

interface NotificationTableProps {
    notifications: NotificationResponse[];
    onEdit: (notification: NotificationResponse) => void;
    onToggleStatus: (id: string) => Promise<void>;
    onDelete: (id: string) => void;
}

export const NotificationTable: React.FC<NotificationTableProps> = ({
    notifications,
    onEdit,
    onToggleStatus,
    onDelete,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
        });
    };

    const getTargetBadgeColor = (target: string) => {
        const colors: Record<string, string> = {
            Citizen: 'bg-purple-100 text-purple-700',
            Collector: 'bg-blue-100 text-blue-700',
            Enterprise: 'bg-orange-100 text-orange-700',
            All: 'bg-gray-100 text-gray-700',
        };
        return colors[target] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityBadgeColor = (priority: string) => {
        const colors: Record<string, string> = {
            Low: 'bg-gray-100 text-gray-600',
            Normal: 'bg-blue-100 text-blue-600',
            High: 'bg-yellow-100 text-yellow-700',
            Urgent: 'bg-red-100 text-red-700',
        };
        return colors[priority] || 'bg-gray-100 text-gray-600';
    };

    const truncateContent = (content: string, maxLength: number = 60) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Content
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Target
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {notifications.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                    No notifications found
                                </td>
                            </tr>
                        ) : (
                            notifications.map((notification, index) => (
                                <tr
                                    key={notification.id}
                                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                        }`}
                                    onClick={() => onEdit(notification)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(notification.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="font-medium text-gray-900">
                                            {notification.title}
                                        </div>
                                        <div className="text-gray-500 text-xs mt-1">
                                            {truncateContent(notification.content)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTargetBadgeColor(
                                                notification.targetAudience
                                            )}`}
                                        >
                                            {notification.targetAudience}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {notification.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadgeColor(
                                                notification.priority
                                            )}`}
                                        >
                                            {notification.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onToggleStatus(notification.id);
                                            }}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${notification.isActive
                                                    ? 'bg-brand-600'
                                                    : 'bg-gray-200'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notification.isActive
                                                        ? 'translate-x-6'
                                                        : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(notification);
                                                }}
                                                className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(notification.id);
                                                }}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
