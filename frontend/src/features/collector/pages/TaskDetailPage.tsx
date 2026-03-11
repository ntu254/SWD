import { useAuth } from '@shared/contexts';
import {
  CollectorTaskResponse,
  collectorTaskService,
} from '@shared/services/api/collectorTaskService';
import { WasteReportResponse, wasteReportService } from '@shared/services/api/wasteReportService';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ImageIcon,
  MapPin,
  Trash2,
  Truck,
  Upload,
  User,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<CollectorTaskResponse | null>(null);
  const [report, setReport] = useState<WasteReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const collectorId = user?.userId ?? '';

  const load = useCallback(async () => {
    if (!collectorId || !id) return;
    setLoading(true);
    setError(null);
    try {
      // Load the task list and find the task by id
      const page = await collectorTaskService.getAssignedTasks(collectorId, 0, 100);
      const found = page.content.find(t => t.id === id);
      if (!found) {
        setError('Không tìm thấy nhiệm vụ này.');
        return;
      }
      setTask(found);

      // Load linked waste report
      try {
        const rep = await wasteReportService.getReportById(found.reportId);
        setReport(rep);
      } catch {
        // report details optional
      }
    } catch {
      setError('Không thể tải chi tiết nhiệm vụ.');
    } finally {
      setLoading(false);
    }
  }, [collectorId, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAccept = async () => {
    if (!task) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const updated = await collectorTaskService.acceptTask(collectorId, task.id);
      setTask(updated);
    } catch {
      setActionError('Không thể chấp nhận nhiệm vụ. Thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        Đang tải chi tiết nhiệm vụ...
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={36} className="mx-auto mb-3 text-red-400" />
        <p className="text-red-600 font-medium">{error ?? 'Không tìm thấy nhiệm vụ'}</p>
        <button
          onClick={() => navigate('/collector/tasks')}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
        >
          Quay lại
        </button>
      </div>
    );
  }

  const cfg = STATUS_CONFIG[task.status] ?? STATUS_CONFIG['ASSIGNED'];
  const mapsUrl =
    report?.latitude && report?.longitude
      ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=16/${report.latitude}/${report.longitude}`
      : null;

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/collector/tasks')}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Chi tiết nhiệm vụ</h1>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            #{task.id.slice(-12).toUpperCase()}
          </p>
        </div>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {actionError && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {actionError}
        </div>
      )}

      {/* Task info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
          <Truck size={15} className="text-emerald-600" />
          Thông tin nhiệm vụ
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Trạng thái</p>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}
            >
              {cfg.label}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Thời gian giao</p>
            <p className="font-medium text-gray-800">{fmtDate(task.assignedAt)}</p>
          </div>
          {task.acceptedAt && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Thời gian chấp nhận</p>
              <p className="font-medium text-gray-800">{fmtDate(task.acceptedAt)}</p>
            </div>
          )}
          {task.collectedAt && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Thời gian hoàn thành</p>
              <p className="font-medium text-gray-800">{fmtDate(task.collectedAt)}</p>
            </div>
          )}
          {task.note && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">Ghi chú</p>
              <p className="text-gray-700">{task.note}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report info */}
      {report && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2">
            <Trash2 size={15} className="text-emerald-600" />
            Thông tin báo cáo rác
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Loại rác</p>
              <p className="font-medium text-gray-800">{report.wasteTypeName ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Khu vực</p>
              <p className="font-medium text-gray-800">{report.areaName ?? '—'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                <MapPin size={11} />
                Địa chỉ
              </p>
              <p className="font-medium text-gray-800">{report.addressText ?? '—'}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:underline mt-1 inline-block"
                >
                  Xem trên bản đồ →
                </a>
              )}
            </div>
            {report.noteText && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">Ghi chú của người dân</p>
                <p className="text-gray-700">{report.noteText}</p>
              </div>
            )}
          </div>

          {/* Citizen info */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={16} className="text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Người báo cáo</p>
              <p className="text-sm font-semibold text-gray-800">{report.citizenName ?? '—'}</p>
            </div>
          </div>

          {/* Report photo */}
          {report.photoUrl && (
            <div>
              <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                <ImageIcon size={11} />
                Ảnh báo cáo
              </p>
              <img
                src={report.photoUrl}
                alt="Waste report"
                className="w-full max-w-sm rounded-xl border border-gray-200 object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* Proof image if uploaded */}
      {task.collectorProofImageUrl && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-2 mb-3">
            <ImageIcon size={15} className="text-emerald-600" />
            Ảnh bằng chứng
          </h2>
          <img
            src={task.collectorProofImageUrl}
            alt="Proof"
            className="w-full max-w-sm rounded-xl border border-gray-200 object-cover"
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {task.status === 'ASSIGNED' && (
          <button
            onClick={handleAccept}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {actionLoading ? 'Đang xử lý...' : 'Chấp nhận nhiệm vụ'}
          </button>
        )}
        {task.status === 'ON_THE_WAY' && (
          <button
            onClick={() => navigate(`/collector/tasks/${task.id}/proof`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors"
          >
            <Upload size={16} />
            Tải ảnh bằng chứng
          </button>
        )}
        {task.status === 'ASSIGNED' || task.status === 'ON_THE_WAY' ? (
          <button
            onClick={async () => {
              setActionLoading(true);
              try {
                const updated = await collectorTaskService.updateTaskStatus(collectorId, task.id, {
                  status: 'FAILED',
                  note: 'Thất bại',
                });
                setTask(updated);
              } catch {
                setActionError('Không thể cập nhật trạng thái.');
              } finally {
                setActionLoading(false);
              }
            }}
            disabled={actionLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
          >
            <Clock size={16} />
            Báo cáo thất bại
          </button>
        ) : null}
      </div>
    </div>
  );
}
