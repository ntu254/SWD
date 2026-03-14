import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'CITIZEN' | 'COLLECTOR' | 'ENTERPRISE' | 'ADMIN';

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  accountStatus: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'PENDING_DELETE';
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  points: number;

  // Actions
  setUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  login: (user: User) => void;
  logout: () => void;
  addPoints: (points: number) => void;
  switchRole: (role: UserRole) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      currentRole: 'CITIZEN',
      points: 0,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setCurrentRole: (role) => set({ currentRole: role }),

      login: (user) => set({
        user,
        isAuthenticated: true,
        currentRole: user.role
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        currentRole: 'CITIZEN',
        points: 0
      }),

      addPoints: (points) => set((state) => ({
        points: state.points + points
      })),

      switchRole: (role) => set({ currentRole: role }),
    }),
    {
      name: 'ecocollect-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Mock user data for development
export const mockUsers: Record<UserRole, User> = {
  CITIZEN: {
    userId: '1',
    email: 'citizen@ecocollect.vn',
    firstName: 'Nguyễn',
    lastName: 'Văn A',
    displayName: 'Nguyễn Văn A',
    role: 'CITIZEN',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=citizen',
  },
  COLLECTOR: {
    userId: '2',
    email: 'collector@ecocollect.vn',
    firstName: 'Trần',
    lastName: 'Văn B',
    displayName: 'Trần Văn B',
    role: 'COLLECTOR',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=collector',
  },
  ENTERPRISE: {
    userId: '3',
    email: 'enterprise@ecocollect.vn',
    firstName: 'Công Ty',
    lastName: 'Tái Chế Xanh',
    displayName: 'Công Ty Tái Chế Xanh',
    role: 'ENTERPRISE',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=enterprise',
  },
  ADMIN: {
    userId: '4',
    email: 'admin@ecocollect.vn',
    firstName: 'Admin',
    lastName: 'Hệ Thống',
    displayName: 'Admin Hệ Thống',
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
  },
};
