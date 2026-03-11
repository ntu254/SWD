import { apiClient } from '../../shared/utils/apiClient';
import { ApiResponse, PageResponse } from '../../shared/types/api';
import { CitizenProfile, ServiceArea, UserResponse, WasteReport, WasteType } from '../../shared/types/domain';

interface SpringPage<T> {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

const toPageResponse = <T>(page: SpringPage<T>): PageResponse<T> => ({
    content: page.content ?? [],
    pageNumber: page.number ?? 0,
    pageSize: page.size ?? (page.content?.length ?? 0),
    totalElements: page.totalElements ?? 0,
    totalPages: page.totalPages ?? 0,
    first: page.first ?? true,
    last: page.last ?? true,
});

export interface CreateWasteReportPayload {
    areaId: string;
    latitude: number;
    longitude: number;
    addressText?: string;
    noteText?: string;
    photoUrl?: string;
    wasteTypeId?: string;
}

export interface UpdateCitizenProfilePayload {
    defaultAreaId?: string;
    addressText?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
}

export interface UpdateUserPayload {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
}

export const citizenService = {
    getMyWasteReports: async (params?: { page?: number; size?: number }): Promise<PageResponse<WasteReport>> => {
        const { data } = await apiClient.get<SpringPage<WasteReport>>('/waste-reports/me', { params });
        return toPageResponse(data);
    },

    getWasteReportById: async (reportId: string): Promise<WasteReport> => {
        const { data } = await apiClient.get<WasteReport>(`/waste-reports/${reportId}`);
        return data;
    },

    createWasteReport: async (payload: CreateWasteReportPayload): Promise<WasteReport> => {
        const { data } = await apiClient.post<WasteReport>('/waste-reports', payload);
        return data;
    },

    getActiveServiceAreas: async (): Promise<ServiceArea[]> => {
        const { data } = await apiClient.get<ServiceArea[]>('/service-areas/active');
        return data ?? [];
    },

    getActiveWasteTypes: async (): Promise<WasteType[]> => {
        const { data } = await apiClient.get<WasteType[]>('/waste-types/active');
        return data ?? [];
    },

    getUser: async (userId: string): Promise<UserResponse> => {
        const { data } = await apiClient.get<UserResponse>(`/users/${userId}`);
        return data;
    },

    updateUser: async (userId: string, payload: UpdateUserPayload): Promise<UserResponse> => {
        const { data } = await apiClient.put<UserResponse>(`/users/${userId}`, payload);
        return data;
    },

    getCitizenProfile: async (userId: string): Promise<CitizenProfile> => {
        const { data } = await apiClient.get<CitizenProfile>(`/users/${userId}/citizen-profile`);
        return data;
    },

    updateCitizenProfile: async (userId: string, payload: UpdateCitizenProfilePayload): Promise<CitizenProfile> => {
        const { data } = await apiClient.put<CitizenProfile>(`/users/${userId}/citizen-profile`, payload);
        return data;
    },

    changePassword: async (userId: string, payload: { oldPassword: string; newPassword: string }): Promise<void> => {
        await apiClient.post(`/users/${userId}/change-password`, payload);
    },

    getMyNotificationsCount: async (): Promise<number> => {
        const { data } = await apiClient.get<ApiResponse<number>>('/notifications/count');
        return data.data ?? 0;
    },
};

