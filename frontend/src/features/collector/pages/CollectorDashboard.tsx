import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import { AlertCircle, CheckCircle2, ClipboardList, Clock, RefreshCw, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ASSIGNED: { label: 'Được giao', color: 'text-blue-700', bg: 'bg-blue-100' },
  ON_THE_WAY: { label: 'Đang đến', color: 'text-amber-700', bg: 'bg-amber-100' },
  COLLECTED: { label: 'Hoàn thành', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  FAILED: { label: 'Thất bại', color: 'text-red-700', bg: 'bg-red-100' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-600', bg: 'bg-gray-100' },
};

function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export default function CollectorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<CollectorTaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectorId = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  const load = useCallback(async () => {
    if (!collectorId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await collectorTaskService.getAssignedTasks(collectorId);
      setTasks(data.content ?? []);
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [collectorId]);

  useEffect(() => {
    load();
  }, [load]);

  const assigned = tasks.filter(t => t.status === 'ASSIGNED');
  const onTheWay = tasks.filter(t => t.status === 'ON_THE_WAY');
  const activeTasks = [...assigned, ...onTheWay];

  const KPI_CARDS = [
    {
      label: 'Nhiệm vụ hôm nay',
      value: tasks.length,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Được giao',
      value: assigned.length,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Đang thực hiện',
      value: onTheWay.length,
      icon: Truck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Hoàn thành',
      value: tasks.filter(t => t.status === 'COLLECTED').length,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Xin chào, {user?.firstName}! 👋</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
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
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* KPI Cards */}
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
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Active tasks */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">Nhiệm vụ đang hoạt động</h2>
          <button
            onClick={() => navigate('/collector/tasks')}
            className="text-sm text-emerald-600 font-semibold hover:underline"
          >
            Xem tất cả →
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : activeTasks.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            <ClipboardList size={36} className="mx-auto mb-2 opacity-30" />
            Không có nhiệm vụ đang hoạt động
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {activeTasks.slice(0, 5).map(task => {
              const cfg = STATUS_CONFIG[task.status];
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/collector/tasks/${task.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Truck size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        Nhiệm vụ #{task.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Giao lúc {fmt(task.assignedAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
                  >
                    {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
