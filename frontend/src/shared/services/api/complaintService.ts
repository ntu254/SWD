import apiClient from './client';
import type {
    ComplaintResponse,
    UpdateComplaintStatusRequest,
    ComplaintFilters,
    ComplaintStatistics,
    PageResponse,
} from '@features/complaint-management/types';

const BASE_URL = '/complaints';

export const complaintService = {
    async getAllComplaints(
        filters: ComplaintFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<ComplaintResponse>> {
        const params: Record<string, string> = {
            page: String(page),
            size: String(size),
            sortBy: 'createdAt',
            sortDir: 'desc',
        };
        if (filters.status) params.status = filters.status;
        if (filters.category) params.category = filters.category;
        if (filters.priority) params.priority = filters.priority;

        const response: any = await apiClient.get(`${BASE_URL}/admin`, { params });
        return response.data;
    },

    async getComplaintById(id: string): Promise<ComplaintResponse> {
        const response: any = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    async updateComplaintStatus(
        id: string,
        request: UpdateComplaintStatusRequest
    ): Promise<ComplaintResponse> {
        const response: any = await apiClient.put(`${BASE_URL}/admin/${id}/status`, request);
        return response.data;
    },

    async deleteComplaint(id: string): Promise<void> {
        await apiClient.delete(`${BASE_URL}/admin/${id}`);
    },

    async getStatistics(): Promise<ComplaintStatistics> {
        const response: any = await apiClient.get(`${BASE_URL}/admin/statistics`);
        return response.data;
    },
};
