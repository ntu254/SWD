import { apiClient } from '../../shared/utils/apiClient';
import { AuthUser, UserRole } from '../../shared/store/authStore';
import { ApiResponse } from '../../shared/types/api';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    user: AuthUser;
}

export const authService = {
    login: async (payload: LoginPayload): Promise<AuthResponse> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
        return data.data;
    },

    register: async (payload: RegisterPayload): Promise<AuthResponse> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
        return data.data;
    },

    refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh-token', { refreshToken });
        return data.data;
    },

    forgotPassword: async (email: string): Promise<void> => {
        await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email });
    },

    resetPassword: async (payload: { email: string; otp: string; newPassword: string }): Promise<AuthResponse> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/reset-password', payload);
        return data.data;
    },

    logout: async (): Promise<void> => {
        await apiClient.post<ApiResponse<void>>('/auth/logout');
    },
};
