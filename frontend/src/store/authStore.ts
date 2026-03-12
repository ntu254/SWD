import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  role: string | null;
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
    role: string;
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      role: null,
      setAuth: (data) => {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        set(data);
      },
      clearAuth: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          email: null,
          role: null,
        });
      },
    }),
    { name: "auth-storage" },
  ),
);
