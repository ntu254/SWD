import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  RefreshCw,
  Truck,
} from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ASSIGNED: { label: 'Được giao', color: 'text-blue-700', bg: 'bg-blue-100' },
  ON_THE_WAY: { label: 'Đang đến', color: 'text-amber-700', bg: 'bg-amber-100' },
  COLLECTED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  FAILED: { label: 'Thất bại', color: 'text-red-700', bg: 'bg-red-100' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-600', bg: 'bg-gray-100' },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type FilterStatus = 'ALL' | 'ASSIGNED' | 'ON_THE_WAY';

export default function MyTasksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<CollectorTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>('ALL');

  const collectorId = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  const load = useCallback(async () => {
    if (!collectorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await collectorTaskService.getAssignedTasks(collectorId);
      setTasks(data.content ?? []);
    } catch {
      setError('Không thể tải danh sách nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  }, [collectorId]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const FILTER_TABS: { key: FilterStatus; label: string; icon: React.ElementType }[] = [
    { key: 'ALL', label: 'Tất cả', icon: Truck },
    { key: 'ASSIGNED', label: 'Được giao', icon: Clock },
    { key: 'ON_THE_WAY', label: 'Đang đến', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhiệm vụ của tôi</h1>
          <p className="text-sm text-gray-500 mt-1">{tasks.length} nhiệm vụ trong ngày</p>
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

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
              ${
                filter === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.key !== 'ALL' && (
              <span
                className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tasks.filter(t => t.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <Truck size={40} className="mx-auto mb-3 opacity-30" />
            Không có nhiệm vụ nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Mã nhiệm vụ</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Thời gian giao</th>
                  <th className="px-6 py-3 text-left">Ghi chú</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(task => {
                  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG['ASSIGNED'];
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                          #{task.id.slice(-10).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{fmtDate(task.assignedAt)}</td>
                      <td className="px-6 py-4 text-gray-500 max-w-40 truncate">
                        {task.note ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/collector/tasks/${task.id}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        >
                          <Eye size={13} />
                          Xem chi tiết
                          <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
