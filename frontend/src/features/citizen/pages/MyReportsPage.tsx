import type { WasteReportResponse } from '@shared/services/api';
import { wasteReportService } from '@shared/services/api';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Filter,
  MapPin,
  Recycle,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STATUS_CONFIG: Record<string, { label: string; dot: string; badge: string }> = {
  PENDING: {
    label: 'Chờ xử lý',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  APPROVED: {
    label: 'Đã tiếp nhận',
    dot: 'bg-blue-400',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  REJECTED: {
    label: 'Đã từ chối',
    dot: 'bg-red-400',
    badge: 'bg-red-100 text-red-700 border-red-200',
  },
  ASSIGNED: {
    label: 'Đã phân công',
    dot: 'bg-indigo-400',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  },
  COMPLETED: {
    label: 'Đã thu gom',
    dot: 'bg-green-400',
    badge: 'bg-green-100 text-green-700 border-green-200',
  },
};

const STATUS_FILTERS = ['Tất cả', 'PENDING', 'APPROVED', 'ASSIGNED', 'COMPLETED', 'REJECTED'];
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  APPROVED: 'Đã tiếp nhận',
  REJECTED: 'Đã từ chối',
  ASSIGNED: 'Đã phân công',
  COMPLETED: 'Đã thu gom',
};

const MyReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [reports, setReports] = useState<WasteReportResponse[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    wasteReportService
      .getMyReports(0, 50)
      .then(page => {
        setReports(page.content);
        setTotalElements(page.totalElements);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = reports.filter((r: WasteReportResponse) => {
    const q = search.toLowerCase();
    const matchSearch =
      (r.wasteTypeName ?? '').toLowerCase().includes(q) ||
      (r.addressText ?? '').toLowerCase().includes(q) ||
      (r.reportId ?? '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Tất cả' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Báo cáo của tôi</h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? 'Đang tải...' : `${totalElements} báo cáo tổng cộng`}
          </p>
        </div>
        <button
          onClick={() => navigate('/citizen/report')}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-md shadow-brand-500/25"
        >
          <Camera size={16} /> Tạo báo cáo
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã, loại rác, địa chỉ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal size={15} className="text-gray-400 flex-shrink-0" />
          {STATUS_FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all
                ${
                  filterStatus === f
                    ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
            >
              {f === 'Tất cả' ? f : (STATUS_LABELS[f] ?? STATUS_CONFIG[f]?.label ?? f)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-sm text-gray-400">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Filter size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Không tìm thấy báo cáo nào</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="hidden md:grid grid-cols-[80px_1fr_160px_120px_80px_48px] gap-4 px-5 py-3 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Ảnh</span>
              <span>Thông tin</span>
              <span>Vị trí</span>
              <span>Trạng thái</span>
              <span>Ngày</span>
              <span />
            </div>

            <div className="divide-y divide-gray-50">
              {filtered.map((r: WasteReportResponse) => {
                const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
                return (
                  <div
                    key={r.reportId}
                    onClick={() => navigate(`/citizen/my-reports/${r.reportId}`)}
                    className="flex md:grid md:grid-cols-[80px_1fr_160px_120px_80px_48px] gap-3 md:gap-4 items-center px-4 md:px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    {/* Image */}
                    {r.photoUrl ? (
                      <img
                        src={r.photoUrl}
                        alt={r.wasteTypeName}
                        className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <Recycle size={22} className="text-gray-400" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">
                        {r.wasteTypeName || 'Rác thải'}
                      </p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {r.reportId.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Location */}
                    <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin size={12} className="flex-shrink-0 text-gray-400" />
                      <span className="line-clamp-2">{r.addressText || r.areaName || '—'}</span>
                    </div>

                    {/* Status */}
                    <div className="hidden md:block">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${s.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="hidden md:flex items-center gap-1 text-xs text-gray-400">
                      <CalendarDays size={12} />
                      {formatDate(r.createdAt)}
                    </div>

                    {/* Arrow */}
                    <div className="md:flex hidden items-center justify-center">
                      <ArrowRight
                        size={16}
                        className="text-gray-300 group-hover:text-brand-500 transition-colors"
                      />
                    </div>

                    {/* Mobile status badge */}
                    <div className="md:hidden flex-shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;
