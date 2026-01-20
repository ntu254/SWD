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
    (error: AxiosError<ApiError>) => {
        // Handle different error scenarios
        if (error.response) {
            // Server responded with error status
            const apiError: ApiError = error.response.data;

            // Handle 401 Unauthorized - clear token and redirect to login
            if (error.response.status === 401) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/auth';
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
