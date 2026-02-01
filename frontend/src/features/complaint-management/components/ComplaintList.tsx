import { AlertCircle, User, Calendar } from 'lucide-react';
import type { ComplaintResponse } from '../types';

interface ComplaintListProps {
    complaints: ComplaintResponse[];
    selectedComplaint: ComplaintResponse | null;
    onSelectComplaint: (complaint: ComplaintResponse) => void;
    loading: boolean;
}

export function ComplaintList({
    complaints,
    selectedComplaint,
    onSelectComplaint,
    loading,
}: ComplaintListProps) {
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

    const formatStatus = (status: string) => {
        return status.replace('_', ' ');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="border border-gray-200 rounded-lg p-3 animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-5 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (complaints.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">No complaints found</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
            {complaints.map((complaint) => {
                const isSelected = selectedComplaint?.id === complaint.id;
                return (
                    <div
                        key={complaint.id}
                        onClick={() => onSelectComplaint(complaint)}
                        className={`
                            border rounded-lg p-3 cursor-pointer transition-all
                            ${isSelected
                                ? 'border-brand-600 bg-brand-50 shadow-sm'
                                : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                            }
                        `}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="text-sm font-medium text-gray-900 truncate">
                                    {complaint.citizenName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(
                                        complaint.status
                                    )}`}
                                >
                                    {formatStatus(complaint.status)}
                                </span>
                                <span
                                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(
                                        complaint.priority
                                    )}`}
                                >
                                    {complaint.priority}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                            {complaint.title}
                        </h4>

                        {/* Description Preview */}
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {truncateText(complaint.description, 100)}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(complaint.createdAt)}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                                {complaint.category.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
