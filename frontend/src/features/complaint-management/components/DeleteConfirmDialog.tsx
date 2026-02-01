import { AlertTriangle, X } from 'lucide-react';
import type { ComplaintResponse } from '../types';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    complaint: ComplaintResponse;
}

export function DeleteConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    complaint,
}: DeleteConfirmDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Delete Complaint</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="mb-6">
                    <p className="text-sm text-gray-700 mb-4">
                        Are you sure you want to delete this complaint? This action cannot be undone.
                    </p>

                    {/* Complaint Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{complaint.title}</p>
                        <p className="text-xs text-gray-600">
                            From: {complaint.citizenName} ({complaint.citizenEmail})
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
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
}
