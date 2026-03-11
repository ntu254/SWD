import { apiClient } from '../../shared/utils/apiClient';
import { ApiResponse, PageResponse } from '../../shared/types/api';
import {
    Complaint,
    ComplaintCategory,
    ComplaintPriority,
} from '../../shared/types/domain';

interface ComplaintPagePayload {
    content: Complaint[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface CreateComplaintPayload {
    title: string;
    content: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    reportId?: string;
    visitId?: string;
}

export const complaintService = {
    createComplaint: async (citizenId: string, payload: CreateComplaintPayload): Promise<Complaint> => {
        const { data } = await apiClient.post<ApiResponse<Complaint>>(`/complaints/citizen/${citizenId}`, payload);
        return data.data;
    },

    getCitizenComplaints: async (
        citizenId: string,
        params?: { page?: number; size?: number; sortBy?: string; sortDir?: 'asc' | 'desc' }
    ): Promise<PageResponse<Complaint>> => {
        const { data } = await apiClient.get<ApiResponse<ComplaintPagePayload>>(`/complaints/citizen/${citizenId}`, {
            params,
        });
        return data.data;
    },
};

