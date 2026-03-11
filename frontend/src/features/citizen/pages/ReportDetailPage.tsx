import type { WasteReportResponse } from '@shared/services/api';
import { wasteReportService } from '@shared/services/api';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Leaf,
  MapPin,
  Recycle,
  Truck,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const STATUS_TIMELINE: Record<string, number> = {
  PENDING: 0,
  APPROVED: 1,
  ASSIGNED: 2,
  COMPLETED: 4,
  REJECTED: -1,
};

const STATUS_BADGE: Record<string, { label: string; badge: string; dot: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  APPROVED: {
    label: 'Đã tiếp nhận',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-400',
  },
  REJECTED: {
    label: 'Đã từ chối',
    badge: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
  ASSIGNED: {
    label: 'Đã phân công',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-400',
  },
  COMPLETED: {
    label: 'Đã thu gom',
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-400',
  },
};

const TIMELINE_STEPS = [
  { id: 0, label: 'Báo cáo được tạo', icon: Circle },
  { id: 1, label: 'Doanh nghiệp tiếp nhận', icon: CheckCircle2 },
  { id: 2, label: 'Đã phân công Collector', icon: User },
  { id: 3, label: 'Collector đang trên đường', icon: Truck },
  { id: 4, label: 'Đã thu gom', icon: CheckCircle2 },
];

const ReportDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<WasteReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    wasteReportService
      .getReportById(id)
      .then(data => setReport(data))
      .catch(() => setError('Không thể tải báo cáo.'))
      .finally(() => setLoading(false));
  }, [id]);

  const currentStep = report ? (STATUS_TIMELINE[report.status] ?? 0) : 0;
  const statusMeta = report
    ? (STATUS_BADGE[report.status] ?? STATUS_BADGE.PENDING)
    : STATUS_BADGE.PENDING;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('vi-VN');
    } catch {
      return iso;
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center text-sm text-gray-400">Đang tải...</div>
    );
  }
  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-red-500">{error ?? 'Báo cáo không tồn tại.'}</p>
        <button
          onClick={() => navigate('/citizen/my-reports')}
          className="mt-4 text-brand-600 text-sm font-semibold"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Back */}
      <button
        onClick={() => navigate('/citizen/my-reports')}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-brand-600 font-semibold transition-colors"
      >
        <ArrowLeft size={16} /> Quay lại danh sách
      </button>

      {/* Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {report.photoUrl ? (
          <img src={report.photoUrl} alt="Waste report" className="w-full h-52 object-cover" />
        ) : (
          <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
            <Recycle size={48} className="text-gray-300" />
          </div>
        )}
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold text-gray-900">
                {report.wasteTypeName || 'Báo cáo rác thải'}
              </h1>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                #{report.reportId.slice(0, 8)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 border text-xs font-bold px-3 py-1.5 rounded-full ${statusMeta.badge}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusMeta.dot}`} />
              {statusMeta.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <MapPin size={14} className="text-brand-500" />,
                label: 'Vị trí',
                value: report.addressText || report.areaName || '—',
              },
              {
                icon: <Clock size={14} className="text-brand-500" />,
                label: 'Ngày tạo',
                value: formatDate(report.createdAt),
              },
              {
                icon: <Leaf size={14} className="text-brand-500 fill-brand-500" />,
                label: 'Điểm thưởng',
                value: '+GP khi thu gom',
              },
              {
                icon: <Recycle size={14} className="text-brand-500" />,
                label: 'Loại rác',
                value: report.wasteTypeName || '—',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.icon}
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                    {item.label}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-5">Tiến trình thu gom</h3>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[17px] top-0 bottom-0 w-0.5 bg-gray-100" />

          <div className="space-y-6">
            {TIMELINE_STEPS.map((step, idx) => {
              const isDone = currentStep >= 0 && idx <= currentStep;
              const isActive =
                currentStep >= 0 &&
                idx === currentStep + 1 &&
                report.status !== 'COMPLETED' &&
                report.status !== 'REJECTED';
              const Icon = step.icon;
              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Node */}
                  <div
                    className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                    ${
                      isDone
                        ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                        : isActive
                          ? 'bg-purple-100 text-purple-600 border-2 border-purple-400 ring-4 ring-purple-100'
                          : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  {/* Label */}
                  <div className="flex-1 pt-1.5">
                    <p
                      className={`text-sm font-bold ${isDone ? 'text-gray-900' : isActive ? 'text-purple-700' : 'text-gray-400'}`}
                    >
                      {step.label}
                    </p>
                    {isActive && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-purple-600 font-semibold bg-purple-50 border border-purple-100 rounded-full px-2.5 py-1">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                        Đang diễn ra
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Collector Info */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-gray-800 mb-4">Collector được phân công</h3>
        {report.status === 'ASSIGNED' || report.status === 'COMPLETED' ? (
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-brand-600" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">Collector đã được phân công</p>
              <p className="text-xs text-gray-400 mt-0.5">Đang trên đường đến vị trí báo cáo</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-gray-400">
            <User size={20} />
            <p className="text-sm">Chưa có collector được phân công</p>
          </div>
        )}
      </div>

      {/* Map Placeholder */}
      <div className="bg-gradient-to-br from-blue-50 to-brand-50 border border-brand-100 rounded-2xl h-48 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto">
            <MapPin size={20} className="text-brand-600" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Bản đồ vị trí báo cáo</p>
          <p className="text-xs text-gray-400">{report.addressText || report.areaName || '—'}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
