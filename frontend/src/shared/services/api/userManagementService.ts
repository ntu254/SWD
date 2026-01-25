import apiClient from './client';
import type {
    AdminUserResponse,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    UserFilters,
    PaginatedResponse,
    ApiPageResponse,
    ApiSingleResponse
} from '@features/user-management/types';

const BASE_URL = '/admin/users';

export const userManagementService = {
    /**
     * Get all users with pagination and filters
     */
    async getAllUsers(filters: UserFilters = {}): Promise<PaginatedResponse<AdminUserResponse>> {
        const params = new URLSearchParams();

        if (filters.page !== undefined) params.append('page', filters.page.toString());
        if (filters.size !== undefined) params.append('size', filters.size.toString());
        if (filters.q) params.append('q', filters.q);
        if (filters.role) params.append('role', filters.role);
        if (filters.enabled !== undefined) params.append('enabled', filters.enabled.toString());
        if (filters.status) params.append('status', filters.status);

        const response: ApiPageResponse = await apiClient.get(
            `${BASE_URL}?${params.toString()}`
        );

        return response.data;
    },

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Create new user
     */
    async createUser(data: CreateUserRequest): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.post(BASE_URL, data);
        return response.data;
    },

    /**
     * Update user details
     */
    async updateUser(id: number, data: UpdateUserRequest): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.put(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    /**
     * Update user role
     */
    async updateUserRole(id: number, data: UpdateUserRoleRequest): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.patch(
            `${BASE_URL}/${id}/role`,
            data
        );
        return response.data;
    },

    /**
     * Update user status (ACTIVE, DISABLED, BANNED, PENDING_DELETE)
     */
    async updateUserStatus(
        id: number,
        data: UpdateUserStatusRequest
    ): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.patch(
            `${BASE_URL}/${id}/status`,
            data
        );
        return response.data;
    },

    /**
     * Soft delete user (sets status to PENDING_DELETE)
     */
    async deleteUser(id: number): Promise<void> {
        await apiClient.delete(`${BASE_URL}/${id}`);
    },

    /**
     * Restore deleted user
     */
    async restoreUser(id: number): Promise<AdminUserResponse> {
        const response: ApiSingleResponse = await apiClient.post(`${BASE_URL}/${id}/restore`);
        return response.data;
    },
};

export default userManagementService;
