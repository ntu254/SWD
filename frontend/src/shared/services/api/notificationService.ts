import apiClient from './client';
import type {
    NotificationResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    NotificationFilters,
    PageResponse,
} from '@features/notification-management/types';

const BASE_URL = '/notifications';

// Map backend pageNumber/pageSize to frontend page/size
const toPage = <T>(r: any): PageResponse<T> => ({
    content: r.content,
    page: r.pageNumber,
    size: r.pageSize,
    totalElements: r.totalElements,
    totalPages: r.totalPages,
    first: r.first,
    last: r.last,
});

export const notificationService = {
    async getAllNotifications(filters: NotificationFilters = {}): Promise<PageResponse<NotificationResponse>> {
        const params: Record<string, string> = {};
        if (filters.type) params.type = filters.type;
        if (filters.targetAudience) params.targetAudience = filters.targetAudience;
        if (filters.isActive !== undefined) params.isActive = String(filters.isActive);
        if (filters.page !== undefined) params.page = String(filters.page);
        if (filters.size !== undefined) params.size = String(filters.size);
        if (filters.sortBy) params.sortBy = filters.sortBy;
        if (filters.sortDir) params.sortDir = filters.sortDir;

        const response: any = await apiClient.get(`${BASE_URL}/admin`, { params });
        return toPage<NotificationResponse>(response.data);
    },

    async getNotificationById(id: string): Promise<NotificationResponse> {
        const response: any = await apiClient.get(`${BASE_URL}/admin/${id}`);
        return response.data;
    },

    async createNotification(adminId: string, data: CreateNotificationRequest): Promise<NotificationResponse> {
        const response: any = await apiClient.post(`${BASE_URL}/admin/${adminId}`, data);
        return response.data;
    },

    async updateNotification(id: string, data: UpdateNotificationRequest): Promise<NotificationResponse> {
        const response: any = await apiClient.put(`${BASE_URL}/admin/${id}`, data);
        return response.data;
    },

    async toggleNotificationStatus(id: string): Promise<NotificationResponse> {
        const response: any = await apiClient.patch(`${BASE_URL}/admin/${id}/toggle`);
        return response.data;
    },

    async deleteNotification(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/admin/${id}`);
    },

    async countActiveNotifications(): Promise<number> {
        const response: any = await apiClient.get(`${BASE_URL}/count`);
        return response.data;
    },

    async getActiveNotificationsForUser(userRole: string, page: number = 0, size: number = 10): Promise<PageResponse<NotificationResponse>> {
        const response: any = await apiClient.get(`${BASE_URL}/user/${userRole}`, { params: { page, size } });
        return toPage<NotificationResponse>(response.data);
    },
};
