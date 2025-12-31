import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { LoginRequest } from '../types';

export const useLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(data);
      
      // Lưu token và thông tin user vào LocalStorage
      // (Shared services/api.ts sẽ tự động lấy token từ đây)
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Chuyển hướng về trang chủ hoặc Dashboard
      navigate('/');
      
    } catch (err: any) {
      // Xử lý lỗi từ service hoặc lỗi mạng
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};