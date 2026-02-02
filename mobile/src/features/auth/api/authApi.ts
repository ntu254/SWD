import { useMutation } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';
import { useAuthStore } from '../../../shared/store/authStore';
import { LoginFormData, RegisterFormData } from '../model/authSchemas';

interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string;
        role: 'CITIZEN' | 'ENTERPRISE' | 'COLLECTOR' | 'ADMIN';
    };
    token: string;
}

export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (data: LoginFormData) => {
            const response = await apiClient.post<AuthResponse>('/api/v1/auth/login', data);
            return response.data;
        },
        onSuccess: async (data) => {
            await setAuth(data.user, data.token);
        },
    });
};

export const useRegister = () => {
    const setAuth = useAuthStore((state) => state.setAuth);

    return useMutation({
        mutationFn: async (data: RegisterFormData) => {
            const { confirmPassword, ...registerData } = data;
            const response = await apiClient.post<AuthResponse>('/api/v1/auth/register', {
                ...registerData,
                role: 'CITIZEN', // Public registration creates CITIZEN accounts only
            });
            return response.data;
        },
        onSuccess: async (data) => {
            await setAuth(data.user, data.token);
        },
    });
};
