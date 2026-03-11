import apiClient from '@shared/services/api/client';
import type {
    TaskResponse,
    TaskAssignmentResponse,
    AssignTaskRequest,
    PageResponse,
    EnterpriseResponse,
} from '../types';

const BASE = '/enterprises';

// Enterprise info
export const getMyEnterprise = (): Promise<{ data: EnterpriseResponse }> =>
    apiClient.get(`${BASE}/me`);

// Task management
export const getPendingApprovalTasks = (
    enterpriseId: string,
    page = 0,
    size = 10
): Promise<PageResponse<TaskResponse>> =>
    apiClient.get(`${BASE}/tasks/pending-approval`, {
        params: { enterpriseId, page, size },
    });

export const acceptTask = (
    taskId: string,
    enterpriseId: string
): Promise<TaskResponse> =>
    apiClient.post(`${BASE}/tasks/${taskId}/accept`, null, {
        params: { enterpriseId },
    });

export const rejectTask = (
    taskId: string,
    enterpriseId: string,
    reason: string
): Promise<TaskResponse> =>
    apiClient.post(`${BASE}/tasks/${taskId}/reject`, null, {
        params: { enterpriseId, reason },
    });

// Task assignment
export const assignTask = (
    request: AssignTaskRequest
): Promise<TaskAssignmentResponse> =>
    apiClient.post('/tasks/assignments', request);

export const getAssignmentsByTask = (
    taskId: string
): Promise<TaskAssignmentResponse[]> =>
    apiClient.get(`/tasks/${taskId}/assignments`);

// All tasks
export const getAllTasks = (
    page = 0,
    size = 10,
    status?: string
): Promise<PageResponse<TaskResponse>> =>
    apiClient.get('/tasks', { params: { page, size, status } });

export const getTasksByStatus = (
    status: string,
    page = 0,
    size = 10
): Promise<PageResponse<TaskResponse>> =>
    apiClient.get(`/tasks/status/${status}`, { params: { page, size } });

// Collection Verification
export const getVisitsByTask = (
    taskId: string,
    page = 0,
    size = 10
): Promise<PageResponse<any>> =>
    apiClient.get(`/collection-visits/task/${taskId}`, { params: { page, size } });

export const verifyCollectionVisit = (
    visitId: string
): Promise<any> => apiClient.patch(`/collection-visits/${visitId}/verify`);
