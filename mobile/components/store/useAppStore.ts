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

export interface RoleCredential {
  email: string;
  password: string;
  userId?: string;
}

interface AuthSessionPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
  role: UserRole;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  currentRole: UserRole;
  points: number;
  accessToken: string | null;
  refreshToken: string | null;
  installationId: string | null;
  roleCredentials: Partial<Record<UserRole, RoleCredential>>;

  // Actions
  setUser: (user: User | null) => void;
  setCurrentRole: (role: UserRole) => void;
  setAuthenticatedSession: (payload: AuthSessionPayload) => void;
  setInstallationId: (installationId: string) => void;
  upsertRoleCredential: (role: UserRole, credential: RoleCredential) => void;
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
      accessToken: null,
      refreshToken: null,
      installationId: null,
      roleCredentials: {},

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setCurrentRole: (role) => set({ currentRole: role }),

      setAuthenticatedSession: ({ user, accessToken, refreshToken, role }) =>
        set({
          user,
          isAuthenticated: true,
          currentRole: role,
          accessToken,
          refreshToken,
        }),

      setInstallationId: (installationId) => set({ installationId }),

      upsertRoleCredential: (role, credential) =>
        set((state) => ({
          roleCredentials: {
            ...state.roleCredentials,
            [role]: {
              ...state.roleCredentials[role],
              ...credential,
            },
          },
        })),

      // Legacy helper for older screens
      login: (user) =>
        set({
          user,
          isAuthenticated: true,
          currentRole: user.role,
        }),

      logout: () =>
        set((state) => ({
          user: null,
          isAuthenticated: false,
          currentRole: 'CITIZEN',
          points: 0,
          accessToken: null,
          refreshToken: null,
          installationId: state.installationId,
          roleCredentials: state.roleCredentials,
        })),

      addPoints: (points) =>
        set((state) => ({
          points: state.points + points,
        })),

      switchRole: (role) => set({ currentRole: role }),
    }),
    {
      name: 'ecocollect-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Mock user data kept for screens still not migrated yet.
export const mockUsers: Record<UserRole, User> = {
  CITIZEN: {
    userId: '1',
    email: 'citizen@ecocollect.vn',
    firstName: 'Nguyen',
    lastName: 'Van A',
    displayName: 'Nguyen Van A',
    role: 'CITIZEN',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=citizen',
  },
  COLLECTOR: {
    userId: '2',
    email: 'collector@ecocollect.vn',
    firstName: 'Tran',
    lastName: 'Van B',
    displayName: 'Tran Van B',
    role: 'COLLECTOR',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=collector',
  },
  ENTERPRISE: {
    userId: '3',
    email: 'enterprise@ecocollect.vn',
    firstName: 'Cong Ty',
    lastName: 'Tai Che Xanh',
    displayName: 'Cong Ty Tai Che Xanh',
    role: 'ENTERPRISE',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=enterprise',
  },
  ADMIN: {
    userId: '4',
    email: 'admin@ecocollect.vn',
    firstName: 'Admin',
    lastName: 'He Thong',
    displayName: 'Admin He Thong',
    role: 'ADMIN',
    accountStatus: 'ACTIVE',
    avatarUrl: 'https://i.pravatar.cc/150?u=admin',
  },
};
