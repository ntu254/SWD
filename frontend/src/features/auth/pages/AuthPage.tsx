import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Recycle, Mail, Lock, User, ArrowRight, ArrowLeft, Building2, Truck, Leaf, MapPin, Scale, Factory } from 'lucide-react';
import Button from '@components/Button';

type UserRole = 'citizen' | 'enterprise' | 'collector';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('citizen');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate('/'); // Go back to home on success for demo
    }, 1500);
  };

  const roleConfig = {
    citizen: { icon: User, label: 'Cư Dân', color: 'bg-brand-500' },
    enterprise: { icon: Building2, label: 'Doanh Nghiệp', color: 'bg-blue-600' },
    collector: { icon: Truck, label: 'Collector', color: 'bg-accent-500' },
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden animate-in fade-in duration-300">

      {/* Back Button (Mobile/Desktop) */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-600 transition-all hover:scale-105"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Left Side - Artistic & Info (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-brand-900 relative items-center justify-center overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-20%] w-[800px] h-[800px] bg-brand-400 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[800px] h-[800px] bg-accent-500 rounded-full blur-[120px]" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-lg p-12 text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-8">
            <Leaf size={16} className="text-brand-300" />
            <span className="text-sm font-bold tracking-wide">GreenLoop Ecosystem</span>
          </div>

          <h1 className="font-display text-6xl font-bold mb-6 leading-tight">
            Biến rác thải thành <span className="text-brand-300">tài nguyên.</span>
          </h1>
          <p className="text-lg text-brand-100 leading-relaxed mb-8">
            Tham gia cộng đồng hơn 50,000 người dùng đang tích cực phân loại rác mỗi ngày. Tích điểm, đổi quà và bảo vệ môi trường cùng GreenLoop.
          </p>

          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex gap-4 items-start">
              <img src="https://i.pravatar.cc/150?u=8" alt="User" className="w-12 h-12 rounded-full border-2 border-brand-300" />
              <div>
                <p className="italic text-brand-50 font-medium text-lg">"Ứng dụng giúp việc tái chế trở nên đơn giản và thú vị hơn bao giờ hết."</p>
                <p className="mt-2 text-sm font-bold text-brand-300">Minh Thư - Top 1 Cư Dân Tuần</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Image */}
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          alt="Nature"
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Mobile decoration */}
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-[80px] -z-10 opacity-50" />

        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center gap-2 mb-6">
              <div className="bg-brand-500 p-2 rounded-xl text-white">
                <Recycle size={24} />
              </div>
              <span className="font-display text-2xl font-bold text-gray-800">GreenLoop</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-gray-900">
              {isLogin ? 'Chào mừng trở lại! 👋' : 'Tạo tài khoản mới 🌱'}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? 'Vui lòng nhập thông tin để đăng nhập.' : 'Điền thông tin bên dưới để bắt đầu hành trình xanh.'}
            </p>
          </div>

          {/* Role Selector (Only for Register or just visual for Login to route) */}
          <div className="bg-gray-100 p-1.5 rounded-2xl flex relative">
            {(['citizen', 'enterprise', 'collector'] as UserRole[]).map((r) => {
              const isActive = role === r;
              const Icon = roleConfig[r].icon;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-200 relative z-10 ${isActive ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  <Icon size={16} className={isActive ? (r === 'citizen' ? 'text-brand-600' : r === 'enterprise' ? 'text-blue-600' : 'text-accent-600') : ''} />
                  {roleConfig[r].label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Enterprise Specific Fields for Registration */}
            {!isLogin && role === 'enterprise' && (
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tên Doanh Nghiệp</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="Công ty TNHH Môi Trường Xanh"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-700 ml-1">Địa Chỉ Nhà Máy / Cơ Sở</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                      type="text"
                      required
                      placeholder="Số 123, KCN Tân Tạo, Bình Tân..."
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Năng Suất (Tấn/Ngày)</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-3.5 text-gray-400" size={20} />
                      <input
                        type="number"
                        placeholder="50"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-700 ml-1">Loại Rác Tiếp Nhận</label>
                    <div className="relative">
                      <Factory className="absolute left-4 top-3.5 text-gray-400" size={20} />
                      <input
                        type="text"
                        placeholder="Nhựa, Giấy, Pin..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1">
                <label className="text-sm font-bold text-gray-700 ml-1">
                  {role === 'enterprise' ? 'Người Đại Diện' : 'Họ và tên'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder={role === 'enterprise' ? "Nguyễn Văn A" : "VD: Nguyễn Văn A"}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  required
                  placeholder="email@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-gray-700">Mật khẩu</label>
                {isLogin && <a href="#" className="text-xs font-bold text-brand-600 hover:underline">Quên mật khẩu?</a>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all font-medium"
                />
              </div>
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={isLoading}
              className="mt-4 group relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang xử lý...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Hoặc tiếp tục với</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-2 font-bold text-gray-700">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors gap-2 font-bold text-gray-700">
              <svg className="w-5 h-5 text-[#1877F2] fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-600">
              {isLogin ? 'Bạn chưa có tài khoản?' : 'Bạn đã có tài khoản?'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setIsLoading(false);
                }}
                className="ml-2 font-bold text-brand-600 hover:text-brand-700 hover:underline transition-all"
              >
                {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}