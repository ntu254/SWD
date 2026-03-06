import axios, { AxiosHeaders } from 'axios';
import { useAuthStore } from '../store/authStore';
import { ApiResponse } from '../types/api';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8080/api/v1';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

const shouldSkipRefresh = (url?: string) =>
    Boolean(
        url &&
            (url.includes('/auth/login') ||
                url.includes('/auth/register') ||
                url.includes('/auth/refresh-token'))
    );

const refreshAccessToken = async (): Promise<string | null> => {
    const { refreshToken, user, clearSession, setSession } = useAuthStore.getState();
    if (!refreshToken || !user) {
        clearSession();
        return null;
    }

    try {
        const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } }
        );

        const nextAccessToken = data?.data?.accessToken;
        const nextRefreshToken = data?.data?.refreshToken;
        if (!nextAccessToken || !nextRefreshToken) {
            clearSession();
            return null;
        }

        setSession({
            user,
            accessToken: nextAccessToken,
            refreshToken: nextRefreshToken,
        });

        return nextAccessToken;
    } catch {
        clearSession();
        return null;
    }
};

// Request interceptor: attach headers used by backend
apiClient.interceptors.request.use((config) => {
    const { accessToken, user } = useAuthStore.getState();
    const headers = AxiosHeaders.from(config.headers);

    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    if (user?.userId) {
        headers.set('X-User-Id', user.userId);
    }

    config.headers = headers;
    return config;
});

// Response interceptor: refresh token once on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        if (error.response?.status !== 401 || originalRequest._retry || shouldSkipRefresh(originalRequest.url)) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;
        if (!refreshPromise) {
            refreshPromise = refreshAccessToken();
        }
        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        if (!newAccessToken) {
            return Promise.reject(error);
        }

        const headers = AxiosHeaders.from(originalRequest.headers);
        headers.set('Authorization', `Bearer ${newAccessToken}`);
        originalRequest.headers = headers;

        return apiClient(originalRequest);
    }
);

export const unwrapApiData = <T>(payload: ApiResponse<T>): T => payload.data;
