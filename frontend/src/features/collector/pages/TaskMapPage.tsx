import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import { WasteReportResponse, wasteReportService } from '@shared/services/api/wasteReportService';
import 'leaflet/dist/leaflet.css';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';

const HCM_CENTER: [number, number] = [10.7769, 106.7009];

const STATUS_CONFIG: Record<string, { label: string; color: string; mapColor: string }> = {
  ASSIGNED: { label: 'Được giao', color: 'text-blue-700', mapColor: '#3b82f6' },
  ON_THE_WAY: { label: 'Đang đến', color: 'text-amber-700', mapColor: '#f59e0b' },
  COLLECTED: { label: 'Hoàn thành', color: 'text-emerald-700', mapColor: '#10b981' },
  FAILED: { label: 'Thất bại', color: 'text-red-700', mapColor: '#ef4444' },
  CANCELLED: { label: 'Đã hủy', color: 'text-gray-600', mapColor: '#9ca3af' },
};

interface TaskWithReport {
  task: CollectorTaskResponse;
  report: WasteReportResponse | null;
}

export default function TaskMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<TaskWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const collectorId = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  const load = useCallback(async () => {
    if (!collectorId) return;
    setLoading(true);
    setError(null);
    try {
      const page = await collectorTaskService.getAssignedTasks(collectorId, 0, 100);
      const tasks = page.content ?? [];

      // Fetch report details for each task (best-effort)
      const enriched = await Promise.all(
        tasks.map(async task => {
          try {
            const report = await wasteReportService.getReportById(task.reportId);
            return { task, report };
          } catch {
            return { task, report: null };
          }
        })
      );
      setItems(enriched);
    } catch {
      setError('Không thể tải dữ liệu bản đồ.');
    } finally {
      setLoading(false);
    }
  }, [collectorId]);

  useEffect(() => {
    load();
  }, [load]);

  const mappable = items.filter(i => i.report?.latitude != null && i.report?.longitude != null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bản đồ nhiệm vụ</h1>
          <p className="text-sm text-gray-500 mt-1">{mappable.length} nhiệm vụ có vị trí GPS</p>
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

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span
              className="w-3 h-3 rounded-full inline-block border-2 border-white shadow"
              style={{ background: cfg.mapColor }}
            />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Map */}
      {loading ? (
        <div className="h-96 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
          Đang tải bản đồ...
        </div>
      ) : (
        <div
          className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
          style={{ height: 520 }}
        >
          <MapContainer center={HCM_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappable.map(({ task, report }) => {
              const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG['ASSIGNED'];
              return (
                <CircleMarker
                  key={task.id}
                  center={[report!.latitude, report!.longitude]}
                  radius={10}
                  pathOptions={{
                    fillColor: cfg.mapColor,
                    fillOpacity: 0.85,
                    color: '#fff',
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => navigate(`/collector/tasks/${task.id}`),
                  }}
                >
                  <Popup>
                    <div className="text-sm space-y-1 min-w-48">
                      <p className="font-bold text-gray-800">#{task.id.slice(-8).toUpperCase()}</p>
                      <p className="text-gray-600">
                        {report?.wasteTypeName ?? 'Không rõ loại rác'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {report?.addressText ?? report?.areaName ?? '—'}
                      </p>
                      <span
                        className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: cfg.mapColor + '20', color: cfg.mapColor }}
                      >
                        {cfg.label}
                      </span>
                      <br />
                      <button
                        onClick={() => navigate(`/collector/tasks/${task.id}`)}
                        className="text-xs text-emerald-600 font-semibold hover:underline mt-1"
                      >
                        Xem chi tiết →
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {!loading && mappable.length === 0 && items.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          Các nhiệm vụ hiện tại không có tọa độ GPS để hiển thị trên bản đồ.
        </div>
      )}
    </div>
  );
}
