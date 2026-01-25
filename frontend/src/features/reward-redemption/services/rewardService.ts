import apiClient from '@shared/services/api/client';
import type { ApiResponse } from '@shared/types';
import type {
  Reward,
  CreateRewardDto,
  UpdateRewardDto,
  RewardFilters,
  RedemptionHistory,
} from '../types';

/**
 * Reward Redemption API Service
 * Handles all API calls related to reward management (CRUD operations)
 */

export const rewardService = {
  /**
   * Get all rewards with optional filters
   */
  getAllRewards: async (filters?: RewardFilters): Promise<ApiResponse<Reward[]>> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.minPoints) params.append('minPoints', filters.minPoints.toString());
    if (filters?.maxPoints) params.append('maxPoints', filters.maxPoints.toString());
    if (filters?.search) params.append('search', filters.search);

    return apiClient.get(`/rewards?${params.toString()}`);
  },

  /**
   * Get a single reward by ID
   */
  getRewardById: async (id: string): Promise<ApiResponse<Reward>> => {
    return apiClient.get(`/rewards/${id}`);
  },

  /**
   * Create a new reward
   */
  createReward: async (data: CreateRewardDto): Promise<ApiResponse<Reward>> => {
    return apiClient.post('/rewards', data);
  },

  /**
   * Update an existing reward
   */
  updateReward: async (data: UpdateRewardDto): Promise<ApiResponse<Reward>> => {
    const { id, ...updateData } = data;
    return apiClient.put(`/rewards/${id}`, updateData);
  },

  /**
   * Delete a reward
   */
  deleteReward: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete(`/rewards/${id}`);
  },

  /**
   * Update reward stock
   */
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Reward>> => {
    return apiClient.patch(`/rewards/${id}/stock`, { stock });
  },

  /**
   * Get redemption history
   */
  getRedemptionHistory: async (): Promise<ApiResponse<RedemptionHistory[]>> => {
    return apiClient.get('/rewards/redemptions');
  },

  /**
   * Get redemption statistics
   */
  getRedemptionStats: async (): Promise<
    ApiResponse<{
      totalRedemptions: number;
      totalPointsSpent: number;
      popularRewards: { rewardId: string; name: string; count: number }[];
    }>
  > => {
    return apiClient.get('/rewards/stats');
  },
};

export default rewardService;
