import type { WasteReportResponse } from '@shared/services/api';
import { wasteReportService } from '@shared/services/api';
import 'leaflet/dist/leaflet.css';
import { Layers, SlidersHorizontal } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; badge: string }> =
  {
    PENDING: {
      label: 'Chờ xử lý',
      color: '#facc15',
      dot: 'bg-yellow-400',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    },
    APPROVED: {
      label: 'Đã tiếp nhận',
      color: '#60a5fa',
      dot: 'bg-blue-400',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
    },
    ASSIGNED: {
      label: 'Đã phân công',
      color: '#818cf8',
      dot: 'bg-indigo-400',
      badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
    COMPLETED: {
      label: 'Đã thu gom',
      color: '#4ade80',
      dot: 'bg-green-400',
      badge: 'bg-green-100 text-green-700 border-green-200',
    },
    REJECTED: {
      label: 'Đã từ chối',
      color: '#f87171',
      dot: 'bg-red-400',
      badge: 'bg-red-100 text-red-700 border-red-200',
    },
  };

const HCM_CENTER: [number, number] = [10.7769, 106.7009];

const WasteMapPage: React.FC = () => {
  const [reports, setReports] = useState<WasteReportResponse[]>([]);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    wasteReportService
      .getAllReports(0, 200)
      .then(page => setReports(page?.content ?? []))
      .catch(() => {});
  }, []);

  // Only show reports with real GPS coordinates
  const withCoords = reports.filter(r => r.latitude != null && r.longitude != null);

  const filtered = withCoords.filter(r => filterStatus === 'Tất cả' || r.status === filterStatus);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-4 md:-m-6">
      {/* Filter bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm relative z-10">
        <Layers size={16} className="text-brand-600" />
        <span className="font-bold text-gray-700 text-sm mr-1">Bộ lọc:</span>

        {['Tất cả', 'PENDING', 'APPROVED', 'ASSIGNED', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex-shrink-0
              ${
                filterStatus === f
                  ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-200'
              }`}
          >
            {f !== 'Tất cả' && STATUS_CONFIG[f] && (
              <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[f].dot}`} />
            )}
            {f === 'Tất cả' ? f : (STATUS_CONFIG[f]?.label ?? f)}
          </button>
        ))}

        <div className="ml-auto">
          <button
            onClick={() => setFilterOpen(o => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal size={13} /> Loại rác
          </button>
        </div>
      </div>

      {/* Waste type sub-filter */}
      {filterOpen && (
        <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0 relative z-10">
          {['Tất cả', 'Nhựa', 'Giấy', 'Kim loại', 'Hữu cơ', 'Nguy hại', 'Hỗn hợp'].map(w => (
            <button
              key={w}
              className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold border bg-white text-gray-500 border-gray-200 hover:border-gray-300 transition-all"
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Real Leaflet Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={HCM_CENTER}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          zoomControl
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filtered.map(r => {
            const s = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING;
            return (
              <CircleMarker
                key={r.reportId}
                center={[r.latitude, r.longitude]}
                radius={10}
                pathOptions={{
                  fillColor: s.color,
                  color: '#ffffff',
                  weight: 2,
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 999,
                        border: '1px solid currentColor',
                        marginBottom: 6,
                      }}
                    >
                      {s.label}
                    </span>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: '4px 0 2px' }}>
                      {r.wasteTypeName || 'Rác thải'}
                    </p>
                    <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>
                      {r.addressText || r.areaName || '—'}
                    </p>
                    {r.createdAt && (
                      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Legend overlay */}
        <div
          className="absolute bottom-8 left-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-md border border-white p-3 space-y-2"
          style={{ zIndex: 1000 }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <span className={`w-3 h-3 rounded-full ${val.dot} flex-shrink-0`} />
              {val.label}
            </div>
          ))}
        </div>

        {/* Notice when reports exist but none have GPS */}
        {reports.length > 0 && withCoords.length === 0 && (
          <div
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-xs text-amber-700 font-semibold shadow"
            style={{ zIndex: 1000 }}
          >
            Báo cáo chưa có tọa độ GPS — không thể hiển thị trên bản đồ
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-6 flex-shrink-0">
        {Object.entries(STATUS_CONFIG).map(([key, val]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${val.dot}`} />
            <span className="text-xs font-semibold text-gray-600">{val.label}</span>
            <span className="text-xs font-bold text-gray-900 bg-gray-100 rounded-md px-1.5 py-0.5">
              {reports.filter(r => r.status === key).length}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WasteMapPage;
