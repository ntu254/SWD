import React, { useEffect, useState } from 'react';
import { Calendar, BarChart3, Recycle, MapPin, TrendingUp } from 'lucide-react';
import { EnterpriseLayout } from '../components/EnterpriseLayout';
import * as enterpriseService from '../services/enterpriseService';
import * as analyticsService from '../services/analyticsService';
import type { EnterpriseSummaryDTO, WasteTypeSummaryDTO, AreaSummaryDTO, DailyStatDTO } from '../types';

export const AnalyticsPage: React.FC = () => {
    const [enterpriseId, setEnterpriseId] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [summary, setSummary] = useState<EnterpriseSummaryDTO | null>(null);
    const [wasteTypes, setWasteTypes] = useState<WasteTypeSummaryDTO[]>([]);
    const [areas, setAreas] = useState<AreaSummaryDTO[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatDTO[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        enterpriseService.getMyEnterprise().then((r) => {
            setEnterpriseId(r.data.id);
        });
    }, []);

    useEffect(() => {
        if (!enterpriseId) return;
        const load = async () => {
            try {
                setLoading(true);
                const [s, w, a, d] = await Promise.all([
                    analyticsService.getEnterpriseSummary(enterpriseId, startDate, endDate),
                    analyticsService.getWasteTypeBreakdown(enterpriseId, startDate, endDate),
                    analyticsService.getAreaBreakdown(enterpriseId, startDate, endDate),
                    analyticsService.getDailyStats(enterpriseId, startDate, endDate),
                ]);
                setSummary(s.data);
                setWasteTypes(w.data || []);
                setAreas(a.data || []);
                setDailyStats(d.data || []);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        load();
    }, [enterpriseId, startDate, endDate]);

    const maxDailyReports = Math.max(...dailyStats.map((d) => d.totalReports), 1);

    return (
        <EnterpriseLayout title="Analytics" subtitle="Collection and recycling reports">
            {/* Date Range */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center gap-4 flex-wrap">
                <Calendar size={18} className="text-gray-400" />
                <div className="flex items-center gap-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    <span className="text-gray-400">to</span>
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48"><div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" /></div>
            ) : (
                <>
                    {/* Summary KPIs */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total Reports', value: summary?.totalReports ?? 0, color: 'text-blue-600 bg-blue-50' },
                            { label: 'Collected', value: summary?.totalCollected ?? 0, color: 'text-emerald-600 bg-emerald-50' },
                            { label: 'Total Weight (kg)', value: summary?.totalWeight?.toFixed(1) ?? '0', color: 'text-teal-600 bg-teal-50' },
                            { label: 'Collection Rate', value: `${(summary?.collectionRate ?? 0).toFixed(0)}%`, color: 'text-amber-600 bg-amber-50' },
                        ].map((k) => (
                            <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                <p className="text-xs text-gray-500">{k.label}</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{k.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Daily Stats Bar Chart (Simple CSS) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><BarChart3 size={18} className="text-emerald-600" />Daily Collection</h3>
                        {dailyStats.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-8">No data for this period</p>
                        ) : (
                            <div className="flex items-end gap-1 h-48 overflow-x-auto">
                                {dailyStats.map((d) => (
                                    <div key={d.date} className="flex flex-col items-center flex-1 min-w-[24px]" title={`${d.date}: ${d.totalReports} reports, ${d.totalCollected} collected`}>
                                        <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '160px' }}>
                                            <div className="w-full bg-emerald-400 rounded-t" style={{ height: `${(d.totalCollected / maxDailyReports) * 100}%`, minHeight: d.totalCollected > 0 ? '4px' : '0' }} />
                                            <div className="w-full bg-blue-300 rounded-t" style={{ height: `${((d.totalReports - d.totalCollected) / maxDailyReports) * 100}%`, minHeight: (d.totalReports - d.totalCollected) > 0 ? '4px' : '0' }} />
                                        </div>
                                        <p className="text-[9px] text-gray-400 mt-1 rotate-[-45deg] w-12 text-center">{d.date.slice(5)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-400 rounded" />Collected</span>
                            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-300 rounded" />Pending</span>
                        </div>
                    </div>

                    {/* Waste Type & Area Breakdown Side by Side */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* By Waste Type */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><Recycle size={18} className="text-teal-600" />By Waste Type</h3>
                            {wasteTypes.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No data</p>
                            ) : (
                                <div className="space-y-3">
                                    {wasteTypes.map((wt) => {
                                        const maxW = Math.max(...wasteTypes.map((w) => w.totalReports), 1);
                                        return (
                                            <div key={wt.wasteTypeId}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm text-gray-700">{wt.wasteTypeName}</p>
                                                    <p className="text-sm font-semibold text-gray-900">{wt.totalReports}</p>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full transition-all" style={{ width: `${(wt.totalReports / maxW) * 100}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* By Area */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4"><MapPin size={18} className="text-indigo-600" />By Area</h3>
                            {areas.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No data</p>
                            ) : (
                                <div className="space-y-3">
                                    {areas.map((a) => {
                                        const maxA = Math.max(...areas.map((x) => x.totalReports), 1);
                                        return (
                                            <div key={a.areaId}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm text-gray-700">{a.areaName}</p>
                                                    <p className="text-sm font-semibold text-gray-900">{a.totalReports}</p>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all" style={{ width: `${(a.totalReports / maxA) * 100}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </EnterpriseLayout>
    );
};

export default AnalyticsPage;
