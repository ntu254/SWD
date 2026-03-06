import apiClient from '@shared/services/api/client';
import type {
    EnterpriseAnalyticsResponse,
    EnterpriseSummaryDTO,
    WasteTypeSummaryDTO,
    AreaSummaryDTO,
    DailyStatDTO,
} from '../types';

const BASE = '/analytics/enterprise';

export const getEnterpriseAnalytics = (
    enterpriseId: string,
    startDate: string,
    endDate: string
): Promise<{ data: EnterpriseAnalyticsResponse }> =>
    apiClient.get(`${BASE}/${enterpriseId}`, {
        params: { startDate, endDate },
    });

export const getEnterpriseSummary = (
    enterpriseId: string,
    startDate: string,
    endDate: string
): Promise<{ data: EnterpriseSummaryDTO }> =>
    apiClient.get(`${BASE}/${enterpriseId}/summary`, {
        params: { startDate, endDate },
    });

export const getWasteTypeBreakdown = (
    enterpriseId: string,
    startDate: string,
    endDate: string
): Promise<{ data: WasteTypeSummaryDTO[] }> =>
    apiClient.get(`${BASE}/${enterpriseId}/by-waste-type`, {
        params: { startDate, endDate },
    });

export const getAreaBreakdown = (
    enterpriseId: string,
    startDate: string,
    endDate: string
): Promise<{ data: AreaSummaryDTO[] }> =>
    apiClient.get(`${BASE}/${enterpriseId}/by-area`, {
        params: { startDate, endDate },
    });

export const getDailyStats = (
    enterpriseId: string,
    startDate: string,
    endDate: string
): Promise<{ data: DailyStatDTO[] }> =>
    apiClient.get(`${BASE}/${enterpriseId}/daily`, {
        params: { startDate, endDate },
    });
