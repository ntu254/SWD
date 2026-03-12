import api from "./axios";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "CITIZEN" | "COLLECTOR";
  enterpriseUserId?: string;
}
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  role: string;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<{ data: AuthResponse }>("/auth/login", data),
  register: (data: RegisterRequest) =>
    api.post<{ data: AuthResponse }>("/auth/register", data),
  refresh: (refreshToken: string) =>
    api.post<{ data: AuthResponse }>("/auth/refresh", { refreshToken }),
  logout: () => api.post("/auth/logout"),
  adminSetup: (data: unknown) => api.post("/auth/admin-setup", data),
};
