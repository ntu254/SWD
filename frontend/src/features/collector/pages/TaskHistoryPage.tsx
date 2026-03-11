import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import { AlertCircle, Filter, History, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COLLECTED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  FAILED: { label: 'Thất bại', color: 'text-red-700', bg: 'bg-red-100' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-600', bg: 'bg-gray-100' },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TaskHistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<CollectorTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const collectorId = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  const load = useCallback(
    async (p = 0) => {
      if (!collectorId) return;
      setLoading(true);
      setError(null);
      try {
        const params: { from?: string; to?: string; page: number; size: number } = {
          page: p,
          size: 20,
        };
        if (from) params.from = new Date(from).toISOString();
        if (to) params.to = new Date(to).toISOString();
        const data = await collectorTaskService.getJobHistory(collectorId, params);
        setHistory(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
        setPage(p);
      } catch {
        setError('Không thể tải lịch sử công việc.');
      } finally {
        setLoading(false);
      }
    },
    [collectorId, from, to]
  );

  useEffect(() => {
    load(0);
  }, [load]);

  const displayed =
    filterStatus === 'ALL' ? history : history.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử công việc</h1>
        <p className="text-sm text-gray-500 mt-1">Tất cả các nhiệm vụ đã hoàn thành</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">
              <Filter size={11} className="inline mr-1" />
              Từ ngày
            </label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Đến ngày</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Trạng thái</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="ALL">Tất cả</option>
              <option value="COLLECTED">Hoàn thành</option>
              <option value="FAILED">Thất bại</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <button
            onClick={() => load(0)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-semibold"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : displayed.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-sm">
            <History size={40} className="mx-auto mb-3 opacity-30" />
            Không có lịch sử công việc
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <th className="px-6 py-3 text-left">Mã nhiệm vụ</th>
                  <th className="px-6 py-3 text-left">Trạng thái</th>
                  <th className="px-6 py-3 text-left">Thời gian giao</th>
                  <th className="px-6 py-3 text-left">Thời gian hoàn thành</th>
                  <th className="px-6 py-3 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {displayed.map(task => {
                  const cfg = STATUS_CONFIG[task.status] ?? {
                    label: task.status,
                    color: 'text-gray-600',
                    bg: 'bg-gray-100',
                  };
                  return (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                          #{task.id.slice(-10).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                        >
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{fmtDate(task.assignedAt)}</td>
                      <td className="px-6 py-4 text-gray-600">{fmtDate(task.collectedAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/collector/tasks/${task.id}`)}
                          className="text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          Xem →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
            <button
              onClick={() => load(page - 1)}
              disabled={page === 0 || loading}
              className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Trước
            </button>
            <span className="text-sm text-gray-500">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => load(page + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-3 py-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Tiếp →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
