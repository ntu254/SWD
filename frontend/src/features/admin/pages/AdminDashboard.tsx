import { userManagementService } from '@shared/services/api';
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  MessageSquare,
  RefreshCw,
  Shield,
  TrendingUp,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await userManagementService.getAllUsers({ size: 1 });
      const active = await userManagementService.getAllUsers({ size: 1, status: 'ACTIVE' });
      const disabled = await userManagementService.getAllUsers({ size: 1, status: 'DISABLED' });
      setStats({
        totalUsers: page.totalElements ?? 0,
        activeUsers: active.totalElements ?? 0,
        pendingUsers: disabled.totalElements ?? 0,
      });
    } catch {
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const kpiCards = [
    {
      label: 'Tổng người dùng',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconColor: 'text-blue-600',
      bg: 'bg-blue-50',
      href: '/admin/users',
    },
    {
      label: 'Đang hoạt động',
      value: stats?.activeUsers ?? 0,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
      href: '/admin/users',
    },
    {
      label: 'Tài khoản tạm khóa',
      value: stats?.pendingUsers ?? 0,
      icon: AlertCircle,
      iconColor: 'text-orange-600',
      bg: 'bg-orange-50',
      href: '/admin/users',
    },
    {
      label: 'Thống kê hệ thống',
      value: '—',
      icon: TrendingUp,
      iconColor: 'text-violet-600',
      bg: 'bg-violet-50',
      href: '/admin/users',
    },
  ];

  const quickLinks = [
    {
      href: '/admin/users',
      label: 'Quản lý người dùng',
      desc: 'Tạo, chỉnh sửa, khóa tài khoản',
      icon: Users,
      iconColor: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      href: '/admin/rewards',
      label: 'Quản lý phần thưởng',
      desc: 'Cấu hình mục đổi thưởng GreenPoints',
      icon: ClipboardList,
      iconColor: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      href: '/admin/notifications',
      label: 'Thông báo hệ thống',
      desc: 'Gửi thông báo đến người dùng',
      icon: Shield,
      iconColor: 'text-violet-600',
      bg: 'bg-violet-50',
    },
    {
      href: '/admin/complaints',
      label: 'Khiếu nại',
      desc: 'Xử lý khiếu nại từ người dùng',
      icon: MessageSquare,
      iconColor: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Bảng điều khiển 🛡️</h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <button
            key={card.label}
            onClick={() => navigate(card.href)}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
          >
            <div className={`w-11 h-11 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={22} className={card.iconColor} />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? <span className="text-gray-300">—</span> : card.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </button>
        ))}
      </div>

      {/* System Status Banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-6"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-10 -right-4 w-56 h-56 bg-white/5 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Shield size={28} className="text-white" />
          </div>
          <div>
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">
              Hệ thống GreenLoop
            </p>
            <h2 className="text-white font-bold text-xl">Quản trị viên</h2>
            <p className="text-violet-100/70 text-sm">
              Toàn quyền quản lý hệ thống và người dùng
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="font-bold text-gray-800 mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(link => (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm text-left group"
            >
              <div className={`w-11 h-11 ${link.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <link.icon size={20} className={link.iconColor} />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">{link.label}</h4>
              <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
