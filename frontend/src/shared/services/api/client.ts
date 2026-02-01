import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError } from '@shared/types';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle responses and errors
apiClient.interceptors.response.use(
    (response) => {
        // Unwrap ApiResponse wrapper and return just the data
        return response.data;
    },
    async (error: AxiosError<ApiError>) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const apiError: ApiError = error.response.data;

            // Handle 401 Unauthorized - clear token and redirect to login
            // Handle 401 Unauthorized - Try to refresh token
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            if (error.response.status === 401 && !originalRequest._retry) {
                // Avoid infinite loop if the refresh endpoint itself fails
                if (originalRequest.url?.includes('/auth/refresh-token')) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth';
                    return Promise.reject(apiError);
                }

                originalRequest._retry = true;

                try {
                    const refreshToken = localStorage.getItem('refreshToken');

                    if (!refreshToken) {
                        throw new Error('No refresh token available');
                    }

                    // Call refresh token endpoint (using raw axios to avoid interceptor issues, though URL check handles it)
                    // Note: API_URL is defined above
                    const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {
                        refreshToken
                    });

                    // Parse response: axios -> data (ApiResponse) -> data (AuthResponse)
                    const authResponse = refreshResponse.data.data;

                    const newAccessToken = authResponse.accessToken;
                    const newRefreshToken = authResponse.refreshToken;

                    // Update storage
                    localStorage.setItem('accessToken', newAccessToken);
                    if (newRefreshToken) {
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Update header for original request
                    originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                    // Return original request with new token
                    return apiClient(originalRequest);

                } catch (refreshError) {
                    // Refresh failed - Logout user
                    console.error('RefreshToken failed:', refreshError);
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    window.location.href = '/auth';
                    return Promise.reject(refreshError);
                }
            }

            return Promise.reject(apiError);
        } else if (error.request) {
            // Request made but no response received
            return Promise.reject({
                success: false,
                message: 'Network error. Please check your connection.',
                timestamp: new Date().toISOString(),
            } as ApiError);
        } else {
            // Something else happened
            return Promise.reject({
                success: false,
                message: error.message || 'An unexpected error occurred',
                timestamp: new Date().toISOString(),
            } as ApiError);
        }
    }
);

export default apiClient;
