import type { UpdateUserRequest, UserResponse } from '@shared/types';
import apiClient from './client';

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
  async getUserById(userId: string): Promise<UserResponse> {
    const response: any = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user
   */
  async updateUser(userId: string, data: UpdateUserRequest): Promise<UserResponse> {
    const response: any = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user (ADMIN only)
   */
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/users/${userId}`);
  },
};
