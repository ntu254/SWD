import React from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container text-center">
      <h2 className="text-green-600">Đăng ký thành công!</h2>
      <p>Chào mừng bạn đến với hệ thống.</p>
      <button onClick={() => navigate('/')} className="btn-primary mt-4">
        Về trang chủ
      </button>
    </div>
  );
};

export default WelcomePage;