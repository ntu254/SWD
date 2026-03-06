import React, { useEffect, useState } from 'react';
import {
    ClipboardList,
    Users,
    TrendingUp,
    AlertTriangle,
    Recycle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
} from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as enterpriseService from '../services/enterpriseService';
import * as analyticsService from '../services/analyticsService';
import type { EnterpriseResponse, EnterpriseSummaryDTO, TaskResponse } from '../types';

export const EnterpriseDashboardPage: React.FC = () => {
    const [enterprise, setEnterprise] = useState<EnterpriseResponse | null>(null);
    const [summary, setSummary] = useState<EnterpriseSummaryDTO | null>(null);
    const [recentTasks, setRecentTasks] = useState<TaskResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const ent = await enterpriseService.getMyEnterprise();
                setEnterprise(ent.data);

                // Last 30 days analytics
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

                const [summaryRes, tasksRes] = await Promise.all([
                    analyticsService.getEnterpriseSummary(ent.data.id, startDate, endDate),
                    enterpriseService.getPendingApprovalTasks(ent.data.id, 0, 5),
                ]);

                setSummary(summaryRes.data);
                setRecentTasks(tasksRes.content || []);
            } catch (err) {
                console.error('Failed to load dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const kpiCards = [
        {
            label: 'Total Reports',
            value: summary?.totalReports ?? 0,
            icon: ClipboardList,
            color: 'from-blue-500 to-blue-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
        },
        {
            label: 'Collected',
            value: summary?.totalCollected ?? 0,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-emerald-600',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-700',
        },
        {
            label: 'Total Weight (kg)',
            value: summary?.totalWeight?.toFixed(1) ?? '0',
            icon: Recycle,
            color: 'from-teal-500 to-teal-600',
            bgColor: 'bg-teal-50',
            textColor: 'text-teal-700',
        },
        {
            label: 'Collection Rate',
            value: `${(summary?.collectionRate ?? 0).toFixed(0)}%`,
            icon: TrendingUp,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
        },
    ];

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            PENDING_APPROVAL: 'bg-orange-100 text-orange-700',
            ACCEPTED: 'bg-blue-100 text-blue-700',
            ASSIGNED: 'bg-indigo-100 text-indigo-700',
            ON_THE_WAY: 'bg-purple-100 text-purple-700',
            COLLECTED: 'bg-emerald-100 text-emerald-700',
            REJECTED: 'bg-red-100 text-red-700',
            CANCELLED: 'bg-gray-100 text-gray-600',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    return (
        <EnterpriseLayout
            title={enterprise?.name || 'Enterprise Dashboard'}
            subtitle="Overview of your recycling operations"
        >
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                </div>
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {kpiCards.map((card) => (
                            <div
                                key={card.label}
                                className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                                        <card.icon size={20} className={card.textColor} />
                                    </div>
                                    <ArrowUpRight size={16} className="text-gray-300" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Recent Pending Tasks */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-900">Pending Requests</h3>
                                <p className="text-xs text-gray-500">Tasks awaiting your approval</p>
                            </div>
                            <a
                                href="/enterprise/tasks"
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                            >
                                View all <ArrowUpRight size={14} />
                            </a>
                        </div>

                        {recentTasks.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} className="text-emerald-400" />
                                </div>
                                <h4 className="text-gray-900 font-semibold mb-1">All caught up!</h4>
                                <p className="text-sm text-gray-500">No pending requests at the moment</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {recentTasks.map((task) => (
                                    <div key={task.id} className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <Clock size={18} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{task.wasteType || 'Waste Collection'}</p>
                                                <p className="text-xs text-gray-500">{task.address || 'No address'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadge(task.status)}`}>
                                                {task.status.replace(/_/g, ' ')}
                                            </span>
                                            <span className="text-xs text-gray-400">{new Date(task.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <a
                            href="/enterprise/tasks"
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                        >
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <ClipboardList size={20} className="text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Manage Requests</h4>
                            <p className="text-xs text-gray-500 mt-1">Accept, reject, and assign collection tasks</p>
                        </a>
                        <a
                            href="/enterprise/collectors"
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                        >
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Users size={20} className="text-emerald-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">Manage Collectors</h4>
                            <p className="text-xs text-gray-500 mt-1">Add, edit, or remove collection staff</p>
                        </a>
                        <a
                            href="/enterprise/analytics"
                            className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                        >
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} className="text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-gray-900">View Analytics</h4>
                            <p className="text-xs text-gray-500 mt-1">Reports by waste type, area, and time</p>
                        </a>
                    </div>
                </>
            )}
        </EnterpriseLayout>
    );
};

export default EnterpriseDashboardPage;
