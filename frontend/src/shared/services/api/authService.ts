import apiClient from './client';
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    ApiResponse
} from '@shared/types';

// Token storage keys
const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
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
        this.setRefreshToken(authData.refreshToken);
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
        this.setRefreshToken(authData.refreshToken);
        this.setUser(authData.user);

        return authData;
    },

    /**
     * Logout user - invalidate token on server then clear local storage
     */
    async logout(): Promise<void> {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            console.error('Logout API failed, proceeding with local cleanup', error);
        } finally {
            this.removeToken();
            this.removeRefreshToken();
            this.removeUser();
        }
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
     * Get stored Refresh Token
     */
    getRefreshToken(): string | null {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    /**
     * Set Refresh Token in localStorage
     */
    setRefreshToken(token: string): void {
        if (token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, token);
        }
    },

    /**
     * Remove Refresh Token from localStorage
     */
    removeRefreshToken(): void {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
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

    /**
     * Send OTP for password reset
     */
    async forgotPassword(email: string): Promise<void> {
        await apiClient.post('/auth/forgot-password', { email });
    },

    /**
     * Reset password with OTP
     */
    async resetPassword(email: string, otp: string, newPassword: string): Promise<AuthResponse> {
        const response: any = await apiClient.post('/auth/reset-password', {
            email,
            otp,
            newPassword
        });

        // The endpoint returns AuthResponse (auto login)
        const authData: AuthResponse = response.data;
        this.setToken(authData.accessToken);
        this.setRefreshToken(authData.refreshToken);
        this.setUser(authData.user);

        return authData;
    },

    /**
     * Refresh Access Token using Refresh Token
     */
    async refreshToken(): Promise<AuthResponse> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response: any = await apiClient.post('/auth/refresh-token', {
            refreshToken
        });

        const authData: AuthResponse = response.data;
        this.setToken(authData.accessToken);
        this.setRefreshToken(authData.refreshToken);

        return authData;
    }
};
