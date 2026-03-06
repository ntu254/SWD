import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware';

export type UserRole = 'CITIZEN' | 'COLLECTOR' | 'ENTERPRISE' | 'ADMIN';

export interface AuthUser {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    displayName?: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: UserRole;
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    setSession: (payload: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
    patchUser: (payload: Partial<AuthUser>) => void;
    clearSession: () => void;
    setHydrated: (value: boolean) => void;
}

const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isHydrated: false,
};

export const useAuthStore = create<AuthState>()(
    subscribeWithSelector(
        persist(
            (set) => ({
                ...initialState,
                setSession: ({ user, accessToken, refreshToken }) =>
                    set({
                        user,
                        accessToken,
                        refreshToken,
                        isAuthenticated: true,
                    }),
                patchUser: (payload) =>
                    set((state) => ({
                        user: state.user ? { ...state.user, ...payload } : state.user,
                    })),
                clearSession: () =>
                    set({
                        ...initialState,
                        isHydrated: true,
                    }),
                setHydrated: (value) => set({ isHydrated: value }),
            }),
            {
                name: 'eco-collect-auth',
                storage: createJSONStorage(() => AsyncStorage),
                partialize: (state) => ({
                    user: state.user,
                    accessToken: state.accessToken,
                    refreshToken: state.refreshToken,
                    isAuthenticated: state.isAuthenticated,
                }),
                onRehydrateStorage: () => (state) => {
                    state?.setHydrated(true);
                },
            }
        )
    )
);
