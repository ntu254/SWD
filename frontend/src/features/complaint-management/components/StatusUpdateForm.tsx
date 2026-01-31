import { useState } from 'react';
import type { ComplaintResponse, ComplaintStatus } from '../types';

interface StatusUpdateFormProps {
    complaint: ComplaintResponse;
    onSubmit: (status: ComplaintStatus, adminResponse: string) => Promise<void>;
}

export function StatusUpdateForm({ complaint, onSubmit }: StatusUpdateFormProps) {
    const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
    const [adminResponse, setAdminResponse] = useState(complaint.adminResponse || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminResponse.trim()) {
            alert('Please provide an admin response');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(status, adminResponse);
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            {/* Status Dropdown */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Status
                </label>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                >
                    <option value="Pending">Pending</option>
                    <option value="In_Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>

            {/* Admin Response */}
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                    Admin Response <span className="text-red-500">*</span>
                </label>
                <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Enter your response to the citizen..."
                    rows={3}
                    maxLength={2000}
                    className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 resize-none"
                />
                <p className="text-xs text-gray-500 mt-0.5">
                    {adminResponse.length}/2000 characters
                </p>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting || !adminResponse.trim()}
                className="w-full px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isSubmitting ? 'Updating...' : 'Update Status'}
            </button>
        </form>
    );
}
