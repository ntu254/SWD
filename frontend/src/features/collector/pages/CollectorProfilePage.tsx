import { useAuth } from '@shared/contexts';
import { Building2, Mail, Phone, Shield, Truck, User } from 'lucide-react';

export default function CollectorProfilePage() {
  const { user } = useAuth();

  const fields = [
    {
      label: 'Họ và tên',
      value: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—',
      icon: User,
    },
    { label: 'Email', value: (user as any)?.email ?? '—', icon: Mail },
    { label: 'Số điện thoại', value: (user as any)?.phone ?? '—', icon: Phone },
    {
      label: 'Đơn vị',
      value: (user as any)?.enterpriseName ?? 'GreenLoop Enterprise',
      icon: Building2,
    },
    { label: 'Vai trò', value: 'Nhân viên thu gom', icon: Truck },
  ];

  return (
    <div className="space-y-5 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
        <p className="text-sm text-gray-500 mt-1">Thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 text-white flex items-center gap-5 shadow-md">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold shadow-sm">
          {user?.firstName?.charAt(0).toUpperCase() ?? 'C'}
        </div>
        <div>
          <p className="text-xl font-bold">
            {user?.firstName} {user?.lastName}
          </p>
          <div className="flex items-center gap-1.5 text-emerald-100 text-sm mt-1">
            <Truck size={14} />
            Nhân viên thu gom rác
          </div>
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mt-1">
            <Shield size={12} />
            ID: {(user?.userId ?? '—').slice(-12).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Fields */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {fields.map(field => (
          <div key={field.label} className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <field.icon size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{field.label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{field.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
