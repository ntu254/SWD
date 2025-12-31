import React from 'react';
import LoginForm from '../components/LoginForm';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Đăng nhập</h2>
      <LoginForm />
      <div className="mt-4 text-center">
        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;