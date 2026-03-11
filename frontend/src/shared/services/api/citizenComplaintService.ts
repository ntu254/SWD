import apiClient from './client';

export type ComplaintCategory =
  | 'COLLECTION_ISSUE'
  | 'SERVICE_ISSUE'
  | 'POINTS_ERROR'
  | 'BUG'
  | 'FEATURE'
  | 'OTHER';

export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface CitizenCreateComplaintRequest {
  title: string;
  content: string;
  category: ComplaintCategory;
  priority?: string; // LOW | MEDIUM | HIGH | URGENT
  reportId?: string;
  visitId?: string;
}

export interface CitizenComplaintResponse {
  complaintId: string;
  createdByUserId: string;
  createdByUserName: string;
  title: string;
  content: string;
  category: ComplaintCategory;
  priority: string;
  status: ComplaintStatus;
  adminResponse: string | null;
  reportId: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

const unwrap = (res: any) => res?.data ?? res;

export const citizenComplaintService = {
  /**
   * POST /complaints/citizen/{citizenId}
   * citizenId comes from user.userId (UUID string from backend)
   */
  async createComplaint(
    citizenId: string,
    body: CitizenCreateComplaintRequest
  ): Promise<CitizenComplaintResponse> {
    const res: any = await apiClient.post(`/complaints/citizen/${citizenId}`, body);
    return unwrap(res);
  },

  /**
   * GET /complaints/citizen/{citizenId}?page=0&size=20
   */
  async getMyCcomplaints(
    citizenId: string,
    page = 0,
    size = 20
  ): Promise<CitizenComplaintResponse[]> {
    const res: any = await apiClient.get(`/complaints/citizen/${citizenId}`, {
      params: { page, size },
    });
    const data = unwrap(res);
    if (data?.content) return data.content;
    return Array.isArray(data) ? data : [];
  },
};
