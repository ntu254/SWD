import apiClient from './client';
import type {
    NotificationResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    NotificationFilters,
    PageResponse,
} from '@features/notification-management/types';

const BASE_URL = '/notifications';

export const notificationService = {
    /**
     * Get all notifications with optional filters (Admin)
     */
    async getAllNotifications(
        filters: NotificationFilters = {}
    ): Promise<PageResponse<NotificationResponse>> {
        const params = new URLSearchParams();

        if (filters.type) params.append('type', filters.type);
        if (filters.targetAudience) params.append('targetAudience', filters.targetAudience);
        if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
        if (filters.page !== undefined) params.append('page', String(filters.page));
        if (filters.size !== undefined) params.append('size', String(filters.size));
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortDir) params.append('sortDir', filters.sortDir);

        const response = await apiClient.get(`${BASE_URL}/admin?${params.toString()}`);
        return response.data;
    },

    /**
     * Get notification by ID (Admin)
     */
    async getNotificationById(id: string): Promise<NotificationResponse> {
        const response = await apiClient.get(`${BASE_URL}/admin/${id}`);
        return response.data;
    },

    /**
     * Create new notification (Admin)
     */
    async createNotification(
        adminId: string,
        data: CreateNotificationRequest
    ): Promise<NotificationResponse> {
        const response = await apiClient.post(`${BASE_URL}/admin/${adminId}`, data);
        return response.data;
    },

    /**
     * Update existing notification (Admin)
     */
    async updateNotification(
        id: string,
        data: UpdateNotificationRequest
    ): Promise<NotificationResponse> {
        const response = await apiClient.put(`${BASE_URL}/admin/${id}`, data);
        return response.data;
    },

    /**
     * Toggle notification active status (Admin)
     */
    async toggleNotificationStatus(id: string): Promise<NotificationResponse> {
        const response = await apiClient.patch(`${BASE_URL}/admin/${id}/toggle`);
        return response.data;
    },

    /**
     * Delete notification (Admin)
     */
    async deleteNotification(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/admin/${id}`);
    },

    /**
     * Count active notifications
     */
    async countActiveNotifications(): Promise<number> {
        const response = await apiClient.get(`${BASE_URL}/count`);
        return response.data;
    },

    /**
     * Get active notifications for user role
     */
    async getActiveNotificationsForUser(
        userRole: string,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<NotificationResponse>> {
        const response = await apiClient.get(
            `${BASE_URL}/user/${userRole}?page=${page}&size=${size}`
        );
        return response.data;
    },
};
