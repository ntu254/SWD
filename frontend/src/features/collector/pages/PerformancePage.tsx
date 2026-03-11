import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Star,
  TrendingUp,
  Truck,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

function getThisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
  return { from, to };
}

export default function PerformancePage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<CollectorTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectorId = user?.userId ?? '';

  const load = useCallback(async () => {
    if (!collectorId) return;
    setLoading(true);
    setError(null);
    try {
      const { from, to } = getThisMonthRange();
      const data = await collectorTaskService.getJobHistory(collectorId, { from, to, size: 200 });
      setHistory(data.content ?? []);
    } catch {
      setError('Không thể tải dữ liệu hiệu suất.');
    } finally {
      setLoading(false);
    }
  }, [collectorId]);

  useEffect(() => {
    load();
  }, [load]);

  const total = history.length;
  const collected = history.filter(t => t.status === 'COLLECTED').length;
  const failed = history.filter(t => t.status === 'FAILED').length;
  const cancelled = history.filter(t => t.status === 'CANCELLED').length;
  const completionRate = total > 0 ? Math.round((collected / total) * 100) : 0;

  const KPI_CARDS = [
    {
      label: 'Tổng nhiệm vụ tháng này',
      value: total,
      icon: Truck,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      sub: 'tất cả trạng thái',
    },
    {
      label: 'Hoàn thành',
      value: collected,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      sub: `${completionRate}% tỉ lệ thành công`,
    },
    {
      label: 'Tỉ lệ hoàn thành',
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      sub: `${collected}/${total} nhiệm vụ`,
    },
    {
      label: 'Thất bại / Huỷ',
      value: failed + cancelled,
      icon: XCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      sub: `${failed} thất bại, ${cancelled} huỷ`,
    },
  ];

  const now = new Date();
  const monthName = now.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hiệu suất</h1>
          <p className="text-sm text-gray-500 mt-1">Thống kê {monthName}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-semibold"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map(card => (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div
              className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}
            >
              <card.icon size={20} className={card.color} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{loading ? '—' : card.value}</p>
            <p className="text-xs font-semibold text-gray-700 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Completion rate progress bar */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-sm flex items-center gap-2">
              <Star size={15} className="text-emerald-600" />
              Tỉ lệ hoàn thành tháng này
            </h2>
            <span className="text-2xl font-bold text-emerald-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span>
            <span>Mục tiêu: 90%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      {!loading && total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
            <TrendingUp size={15} className="text-emerald-600" />
            Phân tích theo trạng thái
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Hoàn thành', count: collected, color: 'bg-emerald-500' },
              { label: 'Thất bại', count: failed, color: 'bg-red-400' },
              { label: 'Đã hủy', count: cancelled, color: 'bg-gray-300' },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3">
                <div className="w-20 text-xs text-gray-500 font-medium">{row.label}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${row.color}`}
                    style={{ width: `${total > 0 ? (row.count / total) * 100 : 0}%` }}
                  />
                </div>
                <div className="w-8 text-xs font-bold text-gray-700 text-right">{row.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
