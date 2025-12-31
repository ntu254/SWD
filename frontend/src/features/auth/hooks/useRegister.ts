import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { RegisterRequest } from '../types';

export const useRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = async (data: Omit<RegisterRequest, 'status'>) => {
    setIsLoading(true);
    setError(null);
    try {
      // BR-02: Check duplicate email (MockAPI hạn chế, nên ta cứ gọi POST)
      const payload: RegisterRequest = {
        ...data,
        status: 'PENDING_VERIFICATION' // Main Flow 191
      };
      
      await authService.register(payload);
      
      // Thành công -> Chuyển sang trang Verify
      navigate('/verify-email', { state: { email: data.email } });
      
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading, error };
};