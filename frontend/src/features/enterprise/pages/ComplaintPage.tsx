import React, { useEffect, useState } from 'react';
import { MessageSquare, AlertTriangle, Clock, CheckCircle2, Eye, X } from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import apiClient from '@shared/services/api/client';
import type { ComplaintResponse, ComplaintStatus } from '../types';

export const ComplaintPage: React.FC = () => {
    const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);

    const loadComplaints = async () => {
        try {
            setLoading(true);
            const params: Record<string, any> = { page: 0, size: 20 };
            if (statusFilter) params.status = statusFilter;
            const res: any = await apiClient.get('/complaints/admin', { params });
            setComplaints(res?.data?.content || []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadComplaints(); }, [statusFilter]);

    const STATUS_OPTIONS = [
        { label: 'All', value: '' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'In Progress', value: 'IN_PROGRESS' },
        { label: 'Resolved', value: 'RESOLVED' },
        { label: 'Rejected', value: 'REJECTED' },
    ];

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'PENDING': return <Clock size={14} className="text-yellow-500" />;
            case 'IN_PROGRESS': return <AlertTriangle size={14} className="text-blue-500" />;
            case 'RESOLVED': return <CheckCircle2 size={14} className="text-emerald-500" />;
            default: return <MessageSquare size={14} className="text-gray-400" />;
        }
    };

    const getStatusBadge = (s: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            RESOLVED: 'bg-emerald-100 text-emerald-700',
            REJECTED: 'bg-red-100 text-red-700',
        };
        return styles[s] || 'bg-gray-100 text-gray-700';
    };

    const getPriorityBadge = (p: string) => {
        const styles: Record<string, string> = {
            LOW: 'bg-gray-100 text-gray-600',
            MEDIUM: 'bg-blue-100 text-blue-700',
            HIGH: 'bg-orange-100 text-orange-700',
            CRITICAL: 'bg-red-100 text-red-700',
        };
        return styles[p] || 'bg-gray-100 text-gray-700';
    };

    return (
        <EnterpriseLayout title="Complaint Management" subtitle="Handle collector-related complaints">
            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1 overflow-x-auto shadow-sm">
                {STATUS_OPTIONS.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${statusFilter === opt.value ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Complaints List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-16"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
                ) : complaints.length === 0 ? (
                    <div className="p-16 text-center">
                        <CheckCircle2 size={40} className="text-emerald-300 mx-auto mb-3" />
                        <h4 className="text-gray-900 font-semibold mb-1">No complaints</h4>
                        <p className="text-sm text-gray-500">All clear! No complaints to review.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {complaints.map((c) => (
                            <div key={c.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedComplaint(c)}>
                                <div className="flex items-center gap-4">
                                    {getStatusIcon(c.status)}
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{c.title}</p>
                                        <p className="text-xs text-gray-500">By {c.citizenName} • {c.collectorName ? `Against ${c.collectorName}` : 'General'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityBadge(c.priority)}`}>{c.priority}</span>
                                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(c.status)}`}>{c.status.replace(/_/g, ' ')}</span>
                                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Complaint Details</h3>
                            <button onClick={() => setSelectedComplaint(null)} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-3">
                            <div><p className="text-xs text-gray-400">Title</p><p className="text-sm font-medium text-gray-900">{selectedComplaint.title}</p></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><p className="text-xs text-gray-400">Status</p><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(selectedComplaint.status)}`}>{selectedComplaint.status.replace(/_/g, ' ')}</span></div>
                                <div><p className="text-xs text-gray-400">Priority</p><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getPriorityBadge(selectedComplaint.priority)}`}>{selectedComplaint.priority}</span></div>
                                <div><p className="text-xs text-gray-400">Category</p><p className="text-sm text-gray-700">{selectedComplaint.category?.replace(/_/g, ' ')}</p></div>
                                <div><p className="text-xs text-gray-400">Citizen</p><p className="text-sm text-gray-700">{selectedComplaint.citizenName}</p></div>
                            </div>
                            {selectedComplaint.collectorName && <div><p className="text-xs text-gray-400">Collector</p><p className="text-sm text-gray-700">{selectedComplaint.collectorName}</p></div>}
                            <div><p className="text-xs text-gray-400">Description</p><p className="text-sm text-gray-700">{selectedComplaint.description}</p></div>
                            {selectedComplaint.resolution && <div className="bg-emerald-50 p-3 rounded-lg"><p className="text-xs text-emerald-400">Resolution</p><p className="text-sm text-emerald-700">{selectedComplaint.resolution}</p></div>}
                            <p className="text-xs text-gray-400 pt-2">Created: {new Date(selectedComplaint.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            )}
        </EnterpriseLayout>
    );
};

export default ComplaintPage;
