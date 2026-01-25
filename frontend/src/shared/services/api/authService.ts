import apiClient from './client';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse
} from '@shared/types';

// Token storage keys
const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

export const authService = {
    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        // Interceptor already unwraps ApiResponse, so response directly contains data
        const response: any = await apiClient.post(
            '/auth/login',
            { email, password } as LoginRequest
        );

        // Response is AuthResponse directly after unwrapping
        const authData: AuthResponse = response.data;
        this.setToken(authData.accessToken);
        this.setUser(authData.user);

        return authData;
    },

    /**
     * Register new user
     */
    async register(userData: RegisterRequest): Promise<AuthResponse> {
        const response: any = await apiClient.post(
            '/auth/register',
            userData
        );

        const authData: AuthResponse = response.data;
        this.setToken(authData.accessToken);
        this.setUser(authData.user);

        return authData;
    },

    /**
     * Logout user - clear local storage and token
     */
    logout(): void {
        this.removeToken();
        this.removeUser();
    },

    /**
     * Get stored JWT token
     */
    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    /**
     * Set JWT token in localStorage
     */
    setToken(token: string): void {
        localStorage.setItem(TOKEN_KEY, token);
    },

    /**
     * Remove JWT token from localStorage
     */
    removeToken(): void {
        localStorage.removeItem(TOKEN_KEY);
    },

    /**
     * Get stored user data
     */
    getUser(): any | null {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Set user data in localStorage
     */
    setUser(user: any): void {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    /**
     * Remove user data from localStorage
     */
    removeUser(): void {
        localStorage.removeItem(USER_KEY);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!this.getToken();
    },
};
