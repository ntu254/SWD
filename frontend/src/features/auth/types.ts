export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  status: 'PENDING_VERIFICATION' | 'ACTIVE';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  status: string;
}

export interface RegisterResponse {
  data: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string; // Fake token
}