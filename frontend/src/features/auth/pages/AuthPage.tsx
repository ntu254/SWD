import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Recycle, Leaf } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm, RegisterForm, ForgotPasswordForm } from '../components';

export default function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');

  const handleSuccess = () => {
    navigate('/');
  };

  const titles = {
    login: { title: 'Chào mừng trở lại!', subtitle: 'Đăng nhập để tiếp tục quản lý rác thải thông minh' },
    register: { title: 'Tạo tài khoản mới', subtitle: 'Đăng ký để bắt đầu hành trình xanh của bạn' },
    'forgot-password': { title: 'Khôi phục mật khẩu', subtitle: 'Nhập email để nhận hướng dẫn lấy lại mật khẩu' }
  };

  return (
    <div className="min-h-screen bg-white flex relative overflow-hidden">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-600 transition-all hover:scale-105"
      >
        <ArrowLeft size={24} />
      </motion.button>

      {/* Left Side - Artwork & Info (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 relative items-center justify-center p-12 overflow-hidden">
        <div className="max-w-lg text-white z-10 space-y-8">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
              <Recycle className="text-white" size={32} />
            </div>
            <h1 className="text-4xl font-display font-bold">GreenLoop</h1>
          </motion.div>

          {/* Welcome Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-display font-bold leading-tight">
              Tham gia cùng chúng tôi để tạo ra một <span className="text-brand-200">tương lai xanh</span>
            </h2>

            <p className="mt-4 text-lg text-brand-50 leading-relaxed">
              Hơn <span className="font-bold text-white">10,000+</span> người dùng đã tin tưởng GreenLoop
              để quản lý và tái chế rác thải thông minh hơn.
            </p>
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl"
          >
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
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 gap-4 pt-4"
          >
            <div className="flex items-center gap-2">
              <Leaf className="text-brand-300" size={20} />
              <span className="text-sm font-medium">AI Phân loại</span>
            </div>
            <div className="flex items-center gap-2">
              <Recycle className="text-brand-300" size={20} />
              <span className="text-sm font-medium">GreenPoints</span>
            </div>
          </motion.div>
        </div>

        {/* Decorative Background Image */}
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          alt="Nature"
        />

        {/* Floating Elements (Replaced CSS animation with Motion) */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="absolute top-20 right-20 w-32 h-32 bg-brand-400/20 rounded-full blur-3xl"
        />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-xl">
          {/* Form Header */}
          <div className="text-center mb-8">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-4">
              <Recycle className="text-brand-600" size={32} />
              <h1 className="text-2xl font-display font-bold text-gray-800">GreenLoop</h1>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-display font-bold text-gray-800 mb-2">
                  {titles[view].title}
                </h2>
                <p className="text-gray-600">
                  {titles[view].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Auth Forms Container */}
          {/* Auth Forms Container */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 overflow-hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {view === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <LoginForm
                    onToggleRegister={() => setView('register')}
                    onForgotPassword={() => setView('forgot-password')}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              ) : view === 'register' ? (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <RegisterForm
                    onToggleLogin={() => setView('login')}
                    onSuccess={handleSuccess}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="forgot-password"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ForgotPasswordForm
                    onBack={() => setView('login')}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

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