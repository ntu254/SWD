import { useAuth } from '@shared/contexts';
import type { LeaderboardEntry, WasteReportResponse } from '@shared/services/api';
import { citizenRewardService, wasteReportService } from '@shared/services/api';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Circle,
  FileText,
  Gift,
  Leaf,
  Map,
  Recycle,
  TrendingUp,
  Trophy,
  Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const REPORT_STATUS_MAP: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Accepted',
  REJECTED: 'Rejected',
  ASSIGNED: 'Assigned',
  COMPLETED: 'Collected',
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Pending: {
    label: 'Chờ xử lý',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: <Circle size={12} />,
  },
  Accepted: {
    label: 'Đã tiếp nhận',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <CheckCircle2 size={12} />,
  },
  Assigned: {
    label: 'Đã phân công',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: <Truck size={12} />,
  },
  'On the way': {
    label: 'Đang đến',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: <Truck size={12} />,
  },
  Collected: {
    label: 'Đã thu gom',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: <CheckCircle2 size={12} />,
  },
};

const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recentReports, setRecentReports] = useState<WasteReportResponse[]>([]);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [myPoints, setMyPoints] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const userIdStr: string | undefined =
    (user as any)?.userId ?? (user?.id != null ? String(user.id) : undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportsPage, points, lb] = await Promise.all([
          wasteReportService.getMyReports(0, 3),
          citizenRewardService.getMyPoints(),
          citizenRewardService.getLeaderboard(5),
        ]);
        setRecentReports(reportsPage.content);
        setTotalReports(reportsPage.totalElements);
        setMyPoints(points);
        setLeaderboard(lb);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Find current user rank from leaderboard
  const myRank = leaderboard.find(e => e.userId === userIdStr)?.rank ?? '–';

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('vi-VN');
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── Welcome ── */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">
          Chào, {user?.firstName ?? 'Bạn'} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Hôm nay bạn muốn đóng góp gì cho môi trường?</p>
      </div>

      {/* ── Quick Action ── */}
      <div
        onClick={() => navigate('/citizen/report')}
        className="relative overflow-hidden rounded-3xl cursor-pointer group"
        style={{ background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -right-4 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative z-10 p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <Leaf size={13} className="fill-brand-200" />
              Hành động nhanh
            </div>
            <h2 className="font-display text-2xl font-bold text-white mb-1">Báo cáo rác ngay</h2>
            <p className="text-brand-100/80 text-sm">Chụp ảnh · AI phân loại · Nhận điểm</p>
          </div>
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all">
            <Camera size={30} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Báo cáo đã tạo',
            value: loading ? '…' : String(totalReports),
            icon: <FileText size={20} className="text-blue-600" />,
            bg: 'bg-blue-50 border-blue-100',
          },
          {
            label: 'GreenPoints',
            value: loading ? '…' : myPoints.toLocaleString('vi-VN'),
            icon: <Leaf size={20} className="text-brand-600 fill-brand-600" />,
            bg: 'bg-brand-50 border-brand-100',
          },
          {
            label: 'Báo cáo hoàn thành',
            value: loading
              ? '…'
              : String(recentReports.filter(r => r.status === 'COMPLETED').length),
            icon: <Recycle size={20} className="text-violet-600" />,
            bg: 'bg-violet-50 border-violet-100',
          },
          {
            label: 'Xếp hạng khu vực',
            value: loading ? '…' : typeof myRank === 'number' ? `#${myRank}` : '–',
            icon: <Trophy size={20} className="text-amber-600" />,
            bg: 'bg-amber-50 border-amber-100',
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-2xl border p-4 bg-white shadow-sm flex flex-col gap-3 ${stat.bg.split(' ')[1]}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Reports + Leaderboard ── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Reports (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">Báo cáo gần nhất</h3>
            <button
              onClick={() => navigate('/citizen/my-reports')}
              className="text-brand-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all"
            >
              Xem tất cả <ArrowRight size={14} />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">Đang tải...</div>
            ) : recentReports.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                Chưa có báo cáo nào.
              </div>
            ) : (
              recentReports.map(r => {
                const uiStatus = REPORT_STATUS_MAP[r.status] ?? 'Pending';
                const s = STATUS_CONFIG[uiStatus] ?? STATUS_CONFIG.Pending;
                return (
                  <div
                    key={r.reportId}
                    onClick={() => navigate(`/citizen/my-reports/${r.reportId}`)}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    {r.photoUrl ? (
                      <img
                        src={r.photoUrl}
                        alt={r.wasteTypeName}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center">
                        <Recycle size={22} className="text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {r.wasteTypeName || 'Rác thải'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {r.addressText || r.areaName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${s.color}`}
                        >
                          {s.icon} {s.label}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-gray-400">{formatDate(r.createdAt)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Leaderboard (1/3) */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Trophy size={16} className="text-amber-500" />
            <h3 className="font-bold text-gray-800">Leaderboard</h3>
          </div>
          <div className="p-4 space-y-3">
            {leaderboard.map(entry => {
              const isYou = entry.userId === userIdStr;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl ${isYou ? 'bg-brand-50 border border-brand-100' : 'hover:bg-gray-50'} transition-colors`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      entry.rank === 1
                        ? 'bg-yellow-400 text-white'
                        : entry.rank === 2
                          ? 'bg-gray-400 text-white'
                          : isYou
                            ? 'bg-brand-500 text-white'
                            : 'bg-orange-400 text-white'
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-sm font-bold text-gray-600 border-2 border-white shadow-sm">
                    {(entry.firstName?.[0] ?? '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${isYou ? 'text-brand-700' : 'text-gray-800'}`}
                    >
                      {isYou ? 'Bạn' : entry.fullName || `${entry.firstName} ${entry.lastName}`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {entry.totalPoints.toLocaleString('vi-VN')} GP
                    </p>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => navigate('/citizen/rewards')}
              className="w-full mt-2 text-center text-xs text-brand-600 font-semibold py-2 hover:bg-brand-50 rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              Xem bảng xếp hạng <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Quick Nav Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Báo cáo của tôi',
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/citizen/my-reports',
          },
          {
            label: 'Bản đồ rác',
            icon: Map,
            color: 'text-violet-600',
            bg: 'bg-violet-50',
            href: '/citizen/map',
          },
          {
            label: 'Phần thưởng',
            icon: Gift,
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            href: '/citizen/rewards',
          },
          {
            label: 'Hồ sơ',
            icon: TrendingUp,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            href: '/citizen/profile',
          },
        ].map(({ label, icon: Icon, color, bg, href }) => (
          <button
            key={href}
            onClick={() => navigate(href)}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
          >
            <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={22} className={color} />
            </div>
            <span className="text-xs font-semibold text-gray-700">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CitizenDashboard;
