import { useAuth } from '@shared/contexts/AuthContext';
import { Home, ShieldAlert } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForbiddenPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const role = (user?.role || '').toUpperCase();
    if (role === 'COLLECTOR') return '/collector';
    if (role === 'ADMIN' || role === 'ENTERPRISE') return '/enterprise';
    if (role === 'CITIZEN') return '/citizen';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-6xl font-extrabold text-gray-800 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-600 mb-3">Không có quyền truy cập</h2>
        <p className="text-gray-500 mb-8">
          Bạn không có quyền truy cập trang này.
          {user?.role && (
            <span>
              {' '}
              Tài khoản của bạn có vai trò <strong className="text-brand-600">{user.role}</strong>.
            </span>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(getDashboardPath())}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg transition-colors"
          >
            <Home size={18} />
            Về Dashboard của tôi
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
          >
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
