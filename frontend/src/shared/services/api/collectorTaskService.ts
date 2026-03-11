import apiClient from './client';

export interface CollectorTaskResponse {
  id: string;
  collectorId: string;
  reportId: string;
  enterpriseId: string;
  status: 'ASSIGNED' | 'ON_THE_WAY' | 'COLLECTED' | 'FAILED' | 'CANCELLED';
  note: string | null;
  collectorProofImageUrl: string | null;
  assignedAt: string;
  acceptedAt: string | null;
  onWayAt: string | null;
  collectedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTaskStatusRequest {
  status: string;
  note?: string;
}

export interface UploadProofRequest {
  proofImageUrl: string;
  actualWeightKg?: number;
  note?: string;
}

export interface CollectorTaskPage {
  content: CollectorTaskResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const collectorTaskService = {
  getAssignedTasks: (collectorId: string, page = 0, size = 50): Promise<CollectorTaskPage> =>
    apiClient
      .get<CollectorTaskPage>(`/collector/${collectorId}/tasks`, { params: { page, size } })
      .then(r => r.data),

  acceptTask: (collectorId: string, taskId: string): Promise<CollectorTaskResponse> =>
    apiClient
      .patch<CollectorTaskResponse>(`/collector/${collectorId}/tasks/${taskId}/accept`)
      .then(r => r.data),

  updateTaskStatus: (
    collectorId: string,
    taskId: string,
    body: UpdateTaskStatusRequest
  ): Promise<CollectorTaskResponse> =>
    apiClient
      .patch<CollectorTaskResponse>(`/collector/${collectorId}/tasks/${taskId}/status`, body)
      .then(r => r.data),

  uploadProof: (
    collectorId: string,
    taskId: string,
    body: UploadProofRequest
  ): Promise<CollectorTaskResponse> =>
    apiClient
      .post<CollectorTaskResponse>(`/collector/${collectorId}/tasks/${taskId}/proof`, body)
      .then(r => r.data),

  getJobHistory: (
    collectorId: string,
    params?: { from?: string; to?: string; page?: number; size?: number }
  ): Promise<CollectorTaskPage> =>
    apiClient
      .get<CollectorTaskPage>(`/collector/${collectorId}/history`, { params })
      .then(r => r.data),
};
