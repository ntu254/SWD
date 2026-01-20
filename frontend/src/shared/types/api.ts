// API Request Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
}

// API Response Types
export interface UserResponse {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string;
    user: UserResponse;
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp: string;
}

// API Error Types
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    timestamp: string;
}

// API Configuration
export interface ApiConfig {
    baseURL: string;
    timeout?: number;
    headers?: Record<string, string>;
}
