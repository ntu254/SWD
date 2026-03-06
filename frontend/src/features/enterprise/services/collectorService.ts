import apiClient from '@shared/services/api/client';
import type { CollectorResponse, CreateCollectorRequest } from '../types';

// Get collectors belonging to the enterprise (using admin user endpoint filtered by role)
export const getCollectors = (
    page = 0,
    size = 10
): Promise<any> =>
    apiClient.get('/admin/users', {
        params: { page, size, role: 'COLLECTOR' },
    });

export const createCollector = (
    data: CreateCollectorRequest
): Promise<any> =>
    apiClient.post('/admin/users', {
        ...data,
        role: 'COLLECTOR',
    });

export const updateCollector = (
    id: number,
    data: Partial<CreateCollectorRequest>
): Promise<any> =>
    apiClient.put(`/admin/users/${id}`, data);

export const deleteCollector = (id: number): Promise<void> =>
    apiClient.delete(`/admin/users/${id}`);

export const restoreCollector = (id: number): Promise<void> =>
    apiClient.patch(`/admin/users/${id}/restore`);
