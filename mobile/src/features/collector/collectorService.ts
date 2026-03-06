import { apiClient } from '../../shared/utils/apiClient';
import { ApiResponse, PageResponse } from '../../shared/types/api';
import {
    CollectorKpiDaily,
    CollectorProfile,
    CollectorTask,
    JobHistory,
    PerformanceSummary,
    WasteReport,
} from '../../shared/types/domain';

interface EnvelopePage<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

interface Envelope<T> {
    data: T;
}

export interface UpdateCollectorStatusPayload {
    status: CollectorTask['status'];
    note?: string;
}

export interface UpdateCollectorProfilePayload {
    assignedAreaId?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    phone?: string;
    avatarUrl?: string;
    firstName?: string;
    lastName?: string;
}

const unwrapPage = <T>(response: ApiResponse<EnvelopePage<T>>): PageResponse<T> => response.data;

export const collectorService = {
    getAssignedTasks: async (collectorId: string, params?: { page?: number; size?: number }): Promise<PageResponse<CollectorTask>> => {
        const { data } = await apiClient.get<ApiResponse<EnvelopePage<CollectorTask>>>(`/collector/${collectorId}/tasks`, {
            params,
        });
        return unwrapPage(data);
    },

    acceptTask: async (collectorId: string, taskId: string): Promise<void> => {
        await apiClient.patch<ApiResponse<unknown>>(`/collector/${collectorId}/tasks/${taskId}/accept`);
    },

    updateTaskStatus: async (
        collectorId: string,
        taskId: string,
        payload: UpdateCollectorStatusPayload
    ): Promise<CollectorTask> => {
        const { data } = await apiClient.patch<ApiResponse<CollectorTask>>(
            `/collector/${collectorId}/tasks/${taskId}/status`,
            payload
        );
        return data.data;
    },

    uploadProof: async (
        collectorId: string,
        taskId: string,
        collectorProofImageUrl: string,
        wasteTypeId?: string,
        weightKg?: number
    ): Promise<CollectorTask> => {
        const { data } = await apiClient.post<ApiResponse<CollectorTask>>(
            `/collector/${collectorId}/tasks/${taskId}/proof`,
            { collectorProofImageUrl, wasteTypeId, weightKg }
        );
        return data.data;
    },

    getJobHistory: async (
        collectorId: string,
        params?: { page?: number; size?: number; from?: string; to?: string }
    ): Promise<PageResponse<JobHistory>> => {
        const { data } = await apiClient.get<ApiResponse<EnvelopePage<JobHistory>>>(`/collector/${collectorId}/history`, {
            params,
        });
        return unwrapPage(data);
    },

    getPerformanceSummary: async (collectorId: string): Promise<PerformanceSummary> => {
        const { data } = await apiClient.get<ApiResponse<PerformanceSummary>>(`/collector/${collectorId}/performance`);
        return data.data;
    },

    getDailyKpi: async (collectorId: string, date: string): Promise<CollectorKpiDaily | null> => {
        const { data } = await apiClient.get<ApiResponse<CollectorKpiDaily | null>>(`/collector/${collectorId}/kpi/daily`, {
            params: { date },
        });
        return data.data ?? null;
    },

    getKpiHistory: async (collectorId: string, startDate: string, endDate: string): Promise<CollectorKpiDaily[]> => {
        const { data } = await apiClient.get<ApiResponse<CollectorKpiDaily[]>>(`/collector/${collectorId}/kpi/history`, {
            params: { startDate, endDate },
        });
        return data.data ?? [];
    },

    getCollectorProfile: async (collectorId: string): Promise<CollectorProfile> => {
        const { data } = await apiClient.get<CollectorProfile>(`/users/${collectorId}/collector-profile`);
        return data;
    },

    updateCollectorProfile: async (
        collectorId: string,
        payload: UpdateCollectorProfilePayload
    ): Promise<CollectorProfile> => {
        const { data } = await apiClient.put<CollectorProfile>(`/users/${collectorId}/collector-profile`, payload);
        return data;
    },

    updateCollectorLocation: async (collectorId: string, lat: number, lng: number): Promise<CollectorProfile> => {
        const { data } = await apiClient.patch<CollectorProfile>(`/users/${collectorId}/collector-profile/location`, null, {
            params: { lat, lng },
        });
        return data;
    },

    setAvailability: async (collectorId: string, isAvailable: boolean): Promise<CollectorProfile> => {
        const { data } = await apiClient.patch<CollectorProfile>(
            `/users/${collectorId}/collector-profile/availability`,
            null,
            { params: { isAvailable } }
        );
        return data;
    },

    getWasteReportById: async (reportId: string): Promise<WasteReport> => {
        const { data } = await apiClient.get<WasteReport>(`/waste-reports/${reportId}`);
        return data;
    },
};
