import { User, Mail, Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import type { ComplaintResponse } from '@features/complaint-management/types';
import { StatusUpdateForm } from '@features/complaint-management/components/StatusUpdateForm';
import { DeleteConfirmDialog } from '@features/complaint-management/components/DeleteConfirmDialog';

interface ComplaintDetailProps {
    complaint: ComplaintResponse | null;
    onUpdateStatus: (id: string, status: any, adminResponse: any) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function ComplaintDetail({ complaint, onUpdateStatus, onDelete }: ComplaintDetailProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!complaint) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                    <AlertCircle className="mx-auto mb-2 text-gray-300" size={40} />
                    <p className="text-sm">Select a complaint to view details</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In_Progress':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'Urgent':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'High':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Normal':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Low':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        await onDelete(complaint.id);
        setIsDeleteDialogOpen(false);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
                {/* Header with Status, Priority & Delete */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                        <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                                complaint.status
                            )}`}
                        >
                            {complaint.status.replace('_', ' ')}
                        </span>
                        <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                                complaint.priority
                            )}`}
                        >
                            {complaint.priority}
                        </span>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete complaint"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-gray-900">{complaint.title}</h3>

                {/* Citizen Info - Compact */}
                <div className="bg-gray-50 rounded p-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <User size={12} className="text-gray-400" />
                        <span>{complaint.citizenName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate">{complaint.citizenEmail}</span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Description</h4>
                    <p className="text-xs text-gray-600 leading-relaxed max-h-20 overflow-y-auto bg-gray-50 p-1.5 rounded">
                        {complaint.description}
                    </p>
                </div>

                {/* Timeline & Category - Combined */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded p-1.5">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">Timeline</h4>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <Calendar size={10} />
                                <span className="text-[10px]">{formatDate(complaint.createdAt).split(',')[0]}</span>
                            </div>
                            {complaint.resolvedAt && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                    <Clock size={10} />
                                    <span className="text-[10px]">{formatDate(complaint.resolvedAt).split(',')[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 rounded p-1.5">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1">Category</h4>
                        <span className="inline-block px-1.5 py-0.5 bg-white text-gray-700 rounded text-[10px] border border-gray-200">
                            {complaint.category.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Admin Response - Always visible, fills remaining space */}
                <div className={`border rounded p-1.5 flex-1 flex flex-col min-h-0 ${complaint.adminResponse
                    ? 'bg-blue-50 border-blue-200'
                    : complaint.status === 'Rejected'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <h4 className={`text-xs font-semibold mb-1 flex-shrink-0 ${complaint.adminResponse
                        ? 'text-blue-900'
                        : complaint.status === 'Rejected'
                            ? 'text-red-900'
                            : 'text-yellow-900'
                        }`}>
                        Admin Response
                    </h4>
                    {complaint.adminResponse ? (
                        <div className="flex-1 flex flex-col min-h-0">
                            <p className="text-xs text-blue-800 leading-relaxed overflow-y-auto h-full">
                                {complaint.adminResponse}
                            </p>
                            {complaint.resolvedByName && (
                                <p className="text-[10px] text-blue-600 mt-1 flex-shrink-0">
                                    — {complaint.resolvedByName}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p className={`text-xs italic ${complaint.status === 'Rejected'
                                ? 'text-red-700'
                                : complaint.status === 'Pending'
                                    ? 'text-yellow-700'
                                    : 'text-blue-700'
                                }`}>
                                {complaint.status === 'Pending' && '⏳ Chưa được xử lý'}
                                {complaint.status === 'In_Progress' && '🔄 Đang được xử lý...'}
                                {complaint.status === 'Rejected' && '❌ Đã bị từ chối'}
                                {complaint.status === 'Resolved' && '✅ Đã được giải quyết'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Status Update Form - Pinned at bottom */}
            {(complaint.status === 'Pending' || complaint.status === 'In_Progress') && (
                <div className="flex-shrink-0 pt-2 mt-2 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1.5">Update Status</h4>
                    <StatusUpdateForm
                        complaint={complaint}
                        onSubmit={async (status: any, adminResponse: any) => {
                            await onUpdateStatus(complaint.id, status, adminResponse);
                        }}
                    />
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                complaint={complaint}
                onConfirm={confirmDelete}
                onClose={() => setIsDeleteDialogOpen(false)}
            />
        </div>
    );
}
