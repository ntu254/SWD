import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'CITIZEN' | 'ENTERPRISE' | 'COLLECTOR' | 'ADMIN';
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setAuth: (user: User, token: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    loadAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (user, token) => {
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        set({ user, token, isAuthenticated: true, isLoading: false });
    },

    clearAuth: async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    loadAuth: async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userData = await AsyncStorage.getItem('userData');

            if (token && userData) {
                const user = JSON.parse(userData);
                set({ user, token, isAuthenticated: true, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Failed to load auth:', error);
            set({ isLoading: false });
        }
    },
}));
