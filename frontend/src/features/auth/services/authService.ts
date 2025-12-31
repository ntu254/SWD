import apiClient from '../../../shared/services/api';
import { RegisterRequest, LoginRequest, User, LoginResponse } from '../types';

// Feature name: User Registration
export const authService = {
  register: async (data: RegisterRequest): Promise<User> => {
    // Gọi đến resource 'users' trên MockAPI
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },
  
  // Giả lập API verify email (MockAPI không hỗ trợ logic này nên ta chỉ giả vờ gọi)
  verifyEmail: async (email: string, otp: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Verifying ${email} with OTP ${otp}`);
        resolve(true);
      }, 1000);
    });
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // Mẹo giả lập login với MockAPI: Tìm user có email và password khớp
    const response = await apiClient.get<User[]>(`/users`, {
      params: { 
        email: data.email, 
        password: data.password 
      }
    });

    if (response.data.length > 0) {
      const user = response.data[0];
      // Giả lập trả về token
      return {
        user,
        token: `fake-jwt-token-${user.id}-${Date.now()}`
      };
    } else {
      throw new Error("Email hoặc mật khẩu không chính xác.");
    }
  }
};