import Button from '@components/Button';
import { useAuth } from '@shared/contexts';
import { citizenRewardService, wasteReportService } from '@shared/services/api';
import apiClient from '@shared/services/api/client';
import {
  BarChart2,
  Bell,
  CheckCircle2,
  Edit2,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Star,
  Trophy,
  User,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitizenProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: '0912 345 678',
    address: '123 Nguyễn Văn Bảo, Gò Vấp, TP.HCM',
  });

  const [notifications, setNotifications] = useState(true);
  const [totalReports, setTotalReports] = useState<number | null>(null);
  const [myPoints, setMyPoints] = useState<number | null>(null);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const userIdStr: string = (user as any)?.userId ?? (user?.id != null ? String(user.id) : '');

  useEffect(() => {
    if (!userIdStr) return;
    Promise.all([
      wasteReportService.getMyReports(0, 1),
      citizenRewardService.getMyPoints(),
      citizenRewardService.getLeaderboard(100),
    ])
      .then(([reportsPage, pts, lb]) => {
        setTotalReports((reportsPage as any)?.totalElements ?? 0);
        setMyPoints(typeof pts === 'number' ? pts : 0);
        const entry = (lb as any[])?.find((e: any) => e.userId === userIdStr);
        setMyRank(entry?.rank ?? null);
      })
      .catch(() => {});
  }, [userIdStr]);

  const stats = [
    {
      label: 'Tổng báo cáo',
      value: totalReports !== null ? String(totalReports) : '—',
      icon: <BarChart2 size={18} className="text-brand-600" />,
    },
    {
      label: 'Điểm hiện tại',
      value: myPoints !== null ? myPoints.toLocaleString() : '—',
      icon: <Star size={18} className="text-amber-500" />,
    },
    {
      label: 'Xếp hạng',
      value: myRank !== null ? `#${myRank}` : '—',
      icon: <Trophy size={18} className="text-purple-500" />,
    },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userIdStr) return;
    setSaveLoading(true);
    try {
      await apiClient.put(`/users/${userIdStr}`, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
      });
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const field = (label: string, key: keyof typeof form, icon: React.ReactNode, type = 'text') => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type}
          value={form[key]}
          onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
          disabled={!editing}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
            editing
              ? 'border-brand-300 bg-white focus:ring-2 focus:ring-brand-500'
              : 'border-gray-100 bg-gray-50 text-gray-700'
          }`}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý thông tin tài khoản của bạn.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        {/* ── Profile Form ── */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Avatar banner */}
            <div className="relative h-28 bg-gradient-to-br from-brand-500 via-emerald-500 to-teal-400">
              <div className="absolute -bottom-8 left-5 w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center border-2 border-white">
                <span className="text-2xl font-display font-bold text-brand-600">
                  {(form.firstName[0] ?? '?').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="px-5 pt-12 pb-5">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-lg font-bold text-gray-900">
                    {form.firstName} {form.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">{form.email}</p>
                </div>
                {saved && (
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1">
                    <CheckCircle2 size={12} /> Đã lưu
                  </span>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  {field('Họ', 'lastName', <User size={15} />)}
                  {field('Tên', 'firstName', <User size={15} />)}
                </div>
                {field('Email', 'email', <Mail size={15} />, 'email')}
                {field('Số điện thoại', 'phone', <Phone size={15} />, 'tel')}
                {field('Địa chỉ', 'address', <MapPin size={15} />)}

                <div className="flex gap-3 pt-1">
                  {editing ? (
                    <>
                      <Button type="submit" disabled={saveLoading}>
                        {saveLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setEditing(false)}>
                        Hủy
                      </Button>
                    </>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => setEditing(true)}>
                      <Edit2 size={14} className="mr-1.5" /> Chỉnh sửa
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
              <KeyRound size={16} className="text-gray-500" /> Đổi mật khẩu
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Mật khẩu hiện tại', key: 'current' as const },
                { label: 'Mật khẩu mới', key: 'newPw' as const },
                { label: 'Xác nhận mật khẩu mới', key: 'confirm' as const },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                  <input
                    type="password"
                    value={pwForm[key]}
                    onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder="••••••••"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
              {pwError && <p className="text-xs text-red-500">{pwError}</p>}
              {pwSaved && <p className="text-xs text-green-600">Mật khẩu đã được cập nhật!</p>}
              <Button
                variant="outline"
                disabled={
                  !pwForm.current || !pwForm.newPw || pwForm.newPw !== pwForm.confirm || pwLoading
                }
                onClick={async () => {
                  if (!userIdStr) return;
                  setPwLoading(true);
                  setPwError(null);
                  try {
                    await apiClient.post(`/users/${userIdStr}/change-password`, {
                      currentPassword: pwForm.current,
                      newPassword: pwForm.newPw,
                    });
                    setPwSaved(true);
                    setPwForm({ current: '', newPw: '', confirm: '' });
                    setTimeout(() => setPwSaved(false), 3000);
                  } catch {
                    setPwError('Sai mật khẩu hiện tại hoặc lỗi hệ thống.');
                  } finally {
                    setPwLoading(false);
                  }
                }}
              >
                {pwLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="space-y-4">
          {/* Stats */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Thống kê của tôi</h3>
            {stats.map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-2">
                  {s.icon}
                  <span className="text-sm text-gray-600">{s.label}</span>
                </div>
                <span className="font-bold text-gray-900">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Notification toggle */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 mb-4">
              <Bell size={15} className="text-gray-500" /> Thông báo
            </h3>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-gray-600">Nhận thông báo email</span>
              <button
                type="button"
                role="switch"
                aria-checked={notifications}
                onClick={() => setNotifications(n => !n)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications ? 'bg-brand-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>

          {/* Logout */}
          <Button variant="outline" fullWidth onClick={handleLogout}>
            <LogOut size={15} className="mr-2 text-red-500" />
            <span className="text-red-600">Đăng xuất</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfilePage;
