import apiClient from './client';

export interface ServiceAreaResponse {
  areaId: string;
  name: string;
  wardCode: string | null;
  districtCode: string | null;
  city: string | null;
  isActive: boolean;
}

export interface WasteTypeResponse {
  typeId: string;
  code: string;
  name: string;
  description: string;
  pointsPerKg: number;
  isActive: boolean;
}

export interface WasteReportResponse {
  reportId: string;
  citizenUserId: string;
  citizenName: string;
  areaId: string;
  areaName: string;
  wasteTypeId: string;
  wasteTypeName: string;
  addressText: string;
  latitude: number;
  longitude: number;
  noteText: string;
  photoUrl: string;
  status: string; // PENDING | APPROVED | REJECTED | ASSIGNED | COMPLETED
  createdAt: string;
  updatedAt: string;
}

export interface CreateWasteReportRequest {
  areaId?: string;
  addressText?: string;
  latitude?: number;
  longitude?: number;
  noteText?: string;
  photoUrl?: string;
  wasteTypeId?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

const unwrap = (res: any) => res?.data ?? res;

export const wasteReportService = {
  /** GET /waste-types/active */
  async getActiveWasteTypes(): Promise<WasteTypeResponse[]> {
    const res: any = await apiClient.get('/waste-types/active');
    const data = unwrap(res);
    return Array.isArray(data) ? data : (data?.content ?? []);
  },

  /** GET /waste-reports/me — paginated list for current citizen */
  async getMyReports(page = 0, size = 20): Promise<PageResponse<WasteReportResponse>> {
    const res: any = await apiClient.get('/waste-reports/me', { params: { page, size } });
    const data = unwrap(res);
    // backend returns Page<WasteReportResponse>
    if (data?.content) return data;
    // fallback if not paginated
    return {
      content: Array.isArray(data) ? data : [],
      totalElements: 0,
      totalPages: 1,
      size,
      number: 0,
    };
  },

  /** GET /waste-reports/{id} */
  async getReportById(reportId: string): Promise<WasteReportResponse> {
    const res: any = await apiClient.get(`/waste-reports/${reportId}`);
    return unwrap(res);
  },

  /** GET /waste-reports?page=0&size=100 — for map display */
  async getAllReports(page = 0, size = 100): Promise<PageResponse<WasteReportResponse>> {
    const res: any = await apiClient.get('/waste-reports', { params: { page, size } });
    const data = unwrap(res);
    if (data?.content) return data;
    return {
      content: Array.isArray(data) ? data : [],
      totalElements: 0,
      totalPages: 1,
      size,
      number: 0,
    };
  },

  /** POST /waste-reports */
  async createReport(body: CreateWasteReportRequest): Promise<WasteReportResponse> {
    const res: any = await apiClient.post('/waste-reports', body);
    return unwrap(res);
  },

  /** GET /service-areas — list of available service areas */
  async getServiceAreas(): Promise<ServiceAreaResponse[]> {
    const res: any = await apiClient.get('/service-areas');
    const data = unwrap(res);
    if (data?.content) return data.content;
    return Array.isArray(data) ? data : [];
  },
};
