import { useState, useCallback } from 'react';
import { notificationService } from '@shared/services/api/notificationService';
import type {
    NotificationResponse,
    CreateNotificationRequest,
    UpdateNotificationRequest,
    NotificationFilters,
} from '../types';

interface PaginationState {
    currentPage: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 0,
        pageSize: 10,
        total: 0,
        totalPages: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = useCallback(async (filters: NotificationFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await notificationService.getAllNotifications(filters);
            setNotifications(response.content);
            setPagination({
                currentPage: response.page,
                pageSize: response.size,
                total: response.totalElements,
                totalPages: response.totalPages,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch notifications');
            console.error('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createNotification = useCallback(
        async (adminId: string, data: CreateNotificationRequest) => {
            setLoading(true);
            setError(null);
            try {
                await notificationService.createNotification(adminId, data);
            } catch (err: any) {
                setError(err.message || 'Failed to create notification');
                console.error('Create notification error:', err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const updateNotification = useCallback(
        async (id: string, data: UpdateNotificationRequest) => {
            setLoading(true);
            setError(null);
            try {
                await notificationService.updateNotification(id, data);
            } catch (err: any) {
                setError(err.message || 'Failed to update notification');
                console.error('Update notification error:', err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const toggleNotificationStatus = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await notificationService.toggleNotificationStatus(id);
        } catch (err: any) {
            setError(err.message || 'Failed to toggle notification status');
            console.error('Toggle notification error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await notificationService.deleteNotification(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete notification');
            console.error('Delete notification error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        notifications,
        pagination,
        loading,
        error,
        fetchNotifications,
        createNotification,
        updateNotification,
        toggleNotificationStatus,
        deleteNotification,
    };
};
