import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import type { NotificationResponse } from '../types';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    notification: NotificationResponse | null;
    onConfirm: () => void;
    onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    notification,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen || !notification) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Icon */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600" size={24} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    Delete Notification
                </h3>

                {/* Message */}
                <p className="text-gray-600 text-center mb-4">
                    Are you sure you want to delete this notification? This action cannot be undone.
                </p>

                {/* Notification preview */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{notification.content}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
