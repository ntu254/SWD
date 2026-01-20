import apiClient from './client';
import type {
    UserResponse,
    UpdateUserRequest,
    ApiResponse
} from '@shared/types';

export const userService = {
    /**
     * Get all users (ADMIN only)
     */
    async getAllUsers(): Promise<UserResponse[]> {
        const response: any = await apiClient.get('/users');
        return response.data;
    },

    /**
     * Get user by ID
     */
    async getUserById(id: number): Promise<UserResponse> {
        const response: any = await apiClient.get(`/users/${id}`);
        return response.data;
    },

    /**
     * Update user
     */
    async updateUser(id: number, data: UpdateUserRequest): Promise<UserResponse> {
        const response: any = await apiClient.put(
            `/users/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete user (ADMIN only)
     */
    async deleteUser(id: number): Promise<void> {
        await apiClient.delete(`/users/${id}`);
    },
};
