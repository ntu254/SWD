import type {
    NotificationResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    NotificationFilters,
    PageResponse,
} from '@features/notification-management/types';

// ============================================================================
// TEMPORARY: Using MockAPI for testing
// TODO: Switch back to real API when backend is ready
// ============================================================================
const MOCK_API_URL = 'https://697e3fc397386252a26a4250.mockapi.io/api/v1/notifications';

// ============================================================================
// REAL API INTEGRATION (Commented out - uncomment when backend is ready)
// ============================================================================
// import apiClient from './client';
// const BASE_URL = '/notifications';

export const notificationService = {
    /**
     * Get all notifications with optional filters (Admin)
     */
    async getAllNotifications(
        filters: NotificationFilters = {}
    ): Promise<PageResponse<NotificationResponse>> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(MOCK_API_URL);
            const allNotifications: NotificationResponse[] = await response.json();

            let filtered = allNotifications;

            // Apply filters
            if (filters.type) {
                filtered = filtered.filter((n) => n.type === filters.type);
            }
            if (filters.targetAudience) {
                filtered = filtered.filter((n) => n.targetAudience === filters.targetAudience);
            }
            if (filters.isActive !== undefined) {
                filtered = filtered.filter((n) => n.isActive === filters.isActive);
            }

            // Sorting
            const sortBy = (filters.sortBy as keyof NotificationResponse) || 'createdAt';
            const sortDir = filters.sortDir || 'desc';

            filtered.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];
                if (valA === undefined || valB === undefined) return 0;
                if (sortDir === 'asc') return valA > valB ? 1 : -1;
                return valA < valB ? 1 : -1;
            });

            // Pagination
            const page = filters.page || 0;
            const size = filters.size || 10;
            const start = page * size;
            const end = start + size;
            const paginatedData = filtered.slice(start, end);

            return {
                content: paginatedData,
                page,
                size,
                totalElements: filtered.length,
                totalPages: Math.ceil(filtered.length / size),
                first: page === 0,
                last: end >= filtered.length,
            };
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        /*
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
        */
    },

    /**
     * Get notification by ID (Admin)
     */
    async getNotificationById(id: string): Promise<NotificationResponse> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(`${MOCK_API_URL}/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching notification:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const response = await apiClient.get(`${BASE_URL}/admin/${id}`);
        // return response.data;
    },

    /**
     * Create new notification (Admin)
     */
    async createNotification(
        adminId: string,
        data: CreateNotificationRequest
    ): Promise<NotificationResponse> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(MOCK_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    isActive: true,
                    createdById: adminId,
                    createdByName: 'Admin User',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const response = await apiClient.post(`${BASE_URL}/admin/${adminId}`, data);
        // return response.data;
    },

    /**
     * Update existing notification (Admin)
     */
    async updateNotification(
        id: string,
        data: UpdateNotificationRequest
    ): Promise<NotificationResponse> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    updatedAt: new Date().toISOString(),
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating notification:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const response = await apiClient.put(`${BASE_URL}/admin/${id}`, data);
        // return response.data;
    },

    /**
     * Toggle notification active status (Admin)
     */
    async toggleNotificationStatus(id: string): Promise<NotificationResponse> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const current = await this.getNotificationById(id);
            const response = await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isActive: !current.isActive,
                    updatedAt: new Date().toISOString(),
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error toggling notification status:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const response = await apiClient.patch(`${BASE_URL}/admin/${id}/toggle`);
        // return response.data;
    },

    /**
     * Delete notification (Admin)
     */
    async deleteNotification(id: string): Promise<void> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting notification:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // await apiClient.delete(`${BASE_URL}/admin/${id}`);
    },

    /**
     * Count active notifications
     */
    async countActiveNotifications(): Promise<number> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(MOCK_API_URL);
            const all: NotificationResponse[] = await response.json();
            return all.filter((n) => n.isActive).length;
        } catch (error) {
            console.error('Error counting notifications:', error);
            return 0;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const response = await apiClient.get(`${BASE_URL}/count`);
        // return response.data;
    },

    /**
     * Get active notifications for user role
     */
    async getActiveNotificationsForUser(
        userRole: string,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<NotificationResponse>> {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(MOCK_API_URL);
            const all: NotificationResponse[] = await response.json();

            const filtered = all.filter(
                (n) => n.isActive && (n.targetAudience === 'All' || n.targetAudience === userRole)
            );

            const start = page * size;
            const end = start + size;

            return {
                content: filtered.slice(start, end),
                page,
                size,
                totalElements: filtered.length,
                totalPages: Math.ceil(filtered.length / size),
                first: page === 0,
                last: end >= filtered.length,
            };
        } catch (error) {
            console.error('Error fetching user notifications:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        /*
        const response = await apiClient.get(
            `${BASE_URL}/user/${userRole}?page=${page}&size=${size}`
        );
        return response.data;
        */
    },
};
