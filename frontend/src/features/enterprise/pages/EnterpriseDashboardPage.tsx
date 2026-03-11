import React, { useEffect, useState } from 'react';
import {
    ClipboardList,
    Users,
    TrendingUp,
    Recycle,
    CheckCircle2,
    Clock,
    ArrowRight,
    BarChart3,
    AlertCircle,
    Award,
    RefreshCw,
} from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as enterpriseService from '../services/enterpriseService';
import * as analyticsService from '../services/analyticsService';
import type { EnterpriseResponse, EnterpriseSummaryDTO, TaskResponse } from '../types';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, { label: string; style: string }> = {
    PENDING: { label: 'Chờ xử lý', style: 'bg-yellow-100 text-yellow-700' },
    PENDING_APPROVAL: { label: 'Chờ phê duyệt', style: 'bg-orange-100 text-orange-700' },
    ACCEPTED: { label: 'Đã tiếp nhận', style: 'bg-blue-100 text-blue-700' },
    ASSIGNED: { label: 'Đã phân công', style: 'bg-indigo-100 text-indigo-700' },
    ON_THE_WAY: { label: 'Đang đến', style: 'bg-purple-100 text-purple-700' },
    COLLECTED: { label: 'Đã thu gom', style: 'bg-emerald-100 text-emerald-700' },
    REJECTED: { label: 'Từ chối', style: 'bg-red-100 text-red-700' },
    CANCELLED: { label: 'Đã hủy', style: 'bg-gray-100 text-gray-600' },
};

export const EnterpriseDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [enterprise, setEnterprise] = useState<EnterpriseResponse | null>(null);
    const [summary, setSummary] = useState<EnterpriseSummaryDTO | null>(null);
    const [recentTasks, setRecentTasks] = useState<TaskResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);
            const ent = await enterpriseService.getMyEnterprise();
            setEnterprise(ent.data);

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0];

            const [summaryRes, tasksRes] = await Promise.all([
                analyticsService.getEnterpriseSummary(ent.data.id, startDate, endDate),
                enterpriseService.getPendingApprovalTasks(ent.data.id, 0, 6),
            ]);

            setSummary(summaryRes.data);
            setRecentTasks(tasksRes.content || []);
        } catch {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const collectionRate = summary?.collectionRate ?? 0;

    const kpiCards = [
        {
            label: 'Tổng báo cáo',
            value: summary?.totalReports ?? 0,
            sub: '30 ngày qua',
            icon: ClipboardList,
            iconColor: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            label: 'Đã thu gom',
            value: summary?.totalCollected ?? 0,
            sub: 'Hoàn thành',
            icon: CheckCircle2,
            iconColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            label: 'Tổng khối lượng',
            value: `${(summary?.totalWeight ?? 0).toFixed(1)} kg`,
            sub: 'Rác thu gom',
            icon: Recycle,
            iconColor: 'text-teal-600',
            bg: 'bg-teal-50',
        },
        {
            label: 'Tỷ lệ thu gom',
            value: `${collectionRate.toFixed(0)}%`,
            sub: 'Hiệu suất',
            icon: TrendingUp,
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
        },
    ];

    const quickLinks = [
        {
            href: '/enterprise/tasks',
            label: 'Quản lý yêu cầu',
            desc: 'Phê duyệt, từ chối, phân công',
            icon: ClipboardList,
            iconColor: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            href: '/enterprise/collectors',
            label: 'Nhân viên thu gom',
            desc: 'Thêm, chỉnh sửa, xóa',
            icon: Users,
            iconColor: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            href: '/enterprise/analytics',
            label: 'Phân tích dữ liệu',
            desc: 'Báo cáo theo loại, khu vực, thời gian',
            icon: BarChart3,
            iconColor: 'text-amber-600',
            bg: 'bg-amber-50',
        },
        {
            href: '/enterprise/reward-config',
            label: 'Cấu hình phần thưởng',
            desc: 'Điểm GreenPoints cho từng loại rác',
            icon: Award,
            iconColor: 'text-violet-600',
            bg: 'bg-violet-50',
        },
    ];

    return (
        <EnterpriseLayout
            title={enterprise?.name || 'Dashboard'}
            subtitle="Tổng quan hoạt động thu gom rác 30 ngày qua"
            actions={
                <button
                    onClick={loadData}
                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    Làm mới
                </button>
            }
        >
            {error && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpiCards.map(card => (
                    <div
                        key={card.label}
                        className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    >
                        <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center mb-4`}>
                            <card.icon size={22} className={card.iconColor} />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            {loading ? <span className="text-gray-300">—</span> : card.value}
                        </p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">{card.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                    </div>
                ))}
            </div>

            {/* Collection Rate Progress Bar */}
            {!loading && summary && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Tỷ lệ hoàn thành thu gom</h3>
                        <span className="text-2xl font-bold text-emerald-600">{collectionRate.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(collectionRate, 100)}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{summary.totalCollected} đã hoàn thành</span>
                        <span>{summary.totalReports} tổng báo cáo</span>
                    </div>
                </div>
            )}

            {/* Pending Tasks */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900">Yêu cầu chờ phê duyệt</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Các yêu cầu thu gom cần xử lý</p>
                    </div>
                    <button
                        onClick={() => navigate('/enterprise/tasks')}
                        className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
                    >
                        Xem tất cả <ArrowRight size={14} />
                    </button>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-400 text-sm">Đang tải...</div>
                ) : recentTasks.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <h4 className="text-gray-900 font-semibold mb-1">Tất cả đã xử lý!</h4>
                        <p className="text-sm text-gray-400">Không có yêu cầu nào đang chờ</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {recentTasks.map(task => {
                            const st = STATUS_LABELS[task.status] ?? { label: task.status, style: 'bg-gray-100 text-gray-600' };
                            return (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => navigate('/enterprise/tasks')}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Clock size={16} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {task.wasteType || 'Rác thải'}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate max-w-xs">
                                                {task.address || 'Không có địa chỉ'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${st.style}`}>
                                            {st.label}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(task.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map(link => (
                    <button
                        key={link.href}
                        onClick={() => navigate(link.href)}
                        className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm text-left group"
                    >
                        <div className={`w-11 h-11 ${link.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <link.icon size={20} className={link.iconColor} />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">{link.label}</h4>
                        <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
                    </button>
                ))}
            </div>
        </EnterpriseLayout>
    );
};

export default EnterpriseDashboardPage;
