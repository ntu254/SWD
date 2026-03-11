import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import type { AdminUserResponse } from '../types';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    user: AdminUserResponse | null;
    onConfirm: () => Promise<void>;
    onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    user,
    onConfirm,
    onCancel,
}) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            await onConfirm();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-red-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-red-100 bg-red-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                        disabled={isDeleting}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* User Info */}
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-700 font-bold">
                                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                                <div className="text-xs text-gray-400 font-mono mt-0.5">
                                    {user.userCode}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="space-y-3">
                        <p className="text-gray-700 font-medium">
                            Are you sure you want to delete this user?
                        </p>
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
                                <div className="text-sm text-amber-800 space-y-2">
                                    <p className="font-semibold">Important Information:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-1">
                                        <li>The user will be scheduled for permanent deletion</li>
                                        <li>They will have <strong>14 days</strong> to be restored</li>
                                        <li>After 14 days, all data will be permanently deleted</li>
                                        <li>The user can be restored before the deadline</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isDeleting}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmDialog;
