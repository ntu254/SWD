import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Recycle, Leaf } from 'lucide-react';
import { LoginForm, RegisterForm } from '../components';

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSuccess = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden animate-in fade-in duration-300">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-600 transition-all hover:scale-105"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Left Side - Artwork & Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 relative items-center justify-center p-12">
        <div className="max-w-lg text-white z-10 space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Recycle className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-display font-bold">GreenLoop</h1>
          </div>

          {/* Welcome Message */}
          <h2 className="text-3xl font-display font-bold leading-tight">
            Tham gia cùng chúng tôi để tạo ra một <span className="text-brand-200">tương lai xanh</span>
          </h2>

          <p className="text-lg text-brand-50 leading-relaxed">
            Hơn <span className="font-bold text-white">10,000+</span> người dùng đã tin tưởng GreenLoop
            để quản lý và tái chế rác thải thông minh hơn.
          </p>

          {/* Testimonial */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex gap-4 items-start">
              <img
                src="https://i.pravatar.cc/150?u=8"
                alt="User"
                className="w-12 h-12 rounded-full border-2 border-brand-300"
              />
              <div>
                <p className="italic text-brand-50 font-medium text-lg">
                  "Ứng dụng giúp việc tái chế trở nên đơn giản và thú vị hơn bao giờ hết."
                </p>
                <p className="mt-2 text-sm font-bold text-brand-300">
                  Minh Thư - Top 1 Cư Dân Tuần
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-brand-300" size={20} />
              <span className="text-sm font-medium">AI Phân loại</span>
            </div>
            <div className="flex items-center gap-2">
              <Recycle className="text-brand-300" size={20} />
              <span className="text-sm font-medium">GreenPoints</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Image */}
        <img
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
          alt="Nature"
        />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
              <Recycle className="text-brand-600" size={32} />
              <h1 className="text-2xl font-display font-bold text-gray-800">GreenLoop</h1>
            </div>

            <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">
              {isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
            </h2>
            <p className="text-gray-600">
              {isLogin
                ? 'Đăng nhập để tiếp tục quản lý rác thải thông minh'
                : 'Đăng ký để bắt đầu hành trình xanh của bạn'}
            </p>
          </div>

          {/* Auth Forms Container */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {isLogin ? (
              <LoginForm
                onToggleRegister={() => setIsLogin(false)}
                onSuccess={handleSuccess}
              />
            ) : (
              <RegisterForm
                onToggleLogin={() => setIsLogin(true)}
                onSuccess={handleSuccess}
              />
            )}
          </div>

          {/* Footer Links */}
          <p className="text-center mt-6 text-sm text-gray-500">
            Bằng cách tiếp tục, bạn đồng ý với{' '}
            <a href="#" className="text-brand-600 hover:underline">Điều khoản dịch vụ</a>
            {' '}và{' '}
            <a href="#" className="text-brand-600 hover:underline">Chính sách bảo mật</a>
          </p>
        </div>
      </div>
    </div>
  );
}