import React from 'react';
import RegisterForm from '../components/RegisterForm';
import { Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  return (
    <div className="page-container">
      <h2>Đăng ký tài khoản mới</h2>
      <RegisterForm />
      <div className="mt-4 text-center">
        <p>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;