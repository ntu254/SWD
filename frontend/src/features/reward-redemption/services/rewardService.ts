import apiClient from '@shared/services/api/client';
import type { ApiResponse } from '@shared/types';
import type {
  CreateRewardDto,
  RedemptionHistory,
  Reward,
  RewardFilters,
  UpdateRewardDto,
} from '../types';
import { RewardStatus } from '../types';

// Backend DTO shape
interface RewardItemResponse {
  itemId: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Map backend DTO → frontend Reward
const toReward = (item: RewardItemResponse): Reward => ({
  id: item.itemId,
  name: item.name,
  description: item.description,
  pointsCost: item.pointsCost,
  stock: item.stock,
  imageUrl: item.imageUrl,
  category: 'OTHER' as any,
  status:
    item.stock === 0
      ? RewardStatus.OUT_OF_STOCK
      : item.isActive
        ? RewardStatus.ACTIVE
        : RewardStatus.INACTIVE,
  validFrom: undefined,
  validUntil: undefined,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
});

export const rewardService = {
  /**
   * Get all rewards with optional client-side filters
   */
  getAllRewards: async (filters?: RewardFilters): Promise<ApiResponse<Reward[]>> => {
    try {
      const response: any = await apiClient.get('/reward-items');
      let rewards: Reward[] = (response.data as RewardItemResponse[]).map(toReward);

      if (filters?.status) {
        rewards = rewards.filter(r => r.status === filters.status);
      }
      if (filters?.minPoints !== undefined) {
        rewards = rewards.filter(r => r.pointsCost >= filters.minPoints!);
      }
      if (filters?.maxPoints !== undefined) {
        rewards = rewards.filter(r => r.pointsCost <= filters.maxPoints!);
      }
      if (filters?.search) {
        const s = filters.search.toLowerCase();
        rewards = rewards.filter(
          r => r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)
        );
      }

      return {
        success: true,
        message: 'Rewards fetched successfully',
        data: rewards,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: [],
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get a single reward by ID
   */
  getRewardById: async (id: string): Promise<ApiResponse<Reward>> => {
    try {
      const response: any = await apiClient.get(`/reward-items/${id}`);
      return {
        success: true,
        message: 'Success',
        data: toReward(response.data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: null as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Create a new reward item
   */
  createReward: async (data: CreateRewardDto): Promise<ApiResponse<Reward>> => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        stock: data.stock,
        imageUrl: data.imageUrl,
      };
      const response: any = await apiClient.post('/reward-items', payload);
      return {
        success: true,
        message: 'Reward created successfully',
        data: toReward(response.data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: null as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update a reward item
   */
  updateReward: async (data: UpdateRewardDto): Promise<ApiResponse<Reward>> => {
    const { id, ...rest } = data;
    try {
      const payload = {
        name: rest.name,
        description: rest.description,
        pointsCost: rest.pointsCost,
        stock: rest.stock,
        imageUrl: rest.imageUrl,
      };
      const response: any = await apiClient.put(`/reward-items/${id}`, payload);
      return {
        success: true,
        message: 'Reward updated successfully',
        data: toReward(response.data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: null as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Delete a reward item
   */
  deleteReward: async (id: string): Promise<ApiResponse<void>> => {
    try {
      await apiClient.delete(`/reward-items/${id}`);
      return {
        success: true,
        message: 'Reward deleted successfully',
        data: undefined as any,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: undefined as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Update stock by fetching current item then patching stock
   */
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Reward>> => {
    try {
      const getResponse: any = await apiClient.get(`/reward-items/${id}`);
      const current: RewardItemResponse = getResponse.data;
      const payload = {
        name: current.name,
        description: current.description,
        pointsCost: current.pointsCost,
        stock,
        imageUrl: current.imageUrl,
      };
      const response: any = await apiClient.put(`/reward-items/${id}`, payload);
      return {
        success: true,
        message: 'Stock updated successfully',
        data: toReward(response.data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: null as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Toggle active/inactive state
   */
  toggleActive: async (id: string, activate: boolean): Promise<ApiResponse<Reward>> => {
    try {
      const endpoint = activate ? `/reward-items/${id}/activate` : `/reward-items/${id}/deactivate`;
      const response: any = await apiClient.patch(endpoint);
      return {
        success: true,
        message: 'Status updated',
        data: toReward(response.data),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        message: error?.message ?? 'Unknown error',
        data: null as any,
        timestamp: new Date().toISOString(),
      };
    }
  },

  /**
   * Get redemption history (not yet available on backend)
   */
  getRedemptionHistory: async (): Promise<ApiResponse<RedemptionHistory[]>> => {
    return {
      success: true,
      message: 'No redemption history available',
      data: [],
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Get redemption statistics (not yet available on backend)
   */
  getRedemptionStats: async (): Promise<
    ApiResponse<{
      totalRedemptions: number;
      totalPointsSpent: number;
      popularRewards: { rewardId: string; name: string; count: number }[];
    }>
  > => {
    return {
      success: true,
      message: 'No statistics available',
      data: { totalRedemptions: 0, totalPointsSpent: 0, popularRewards: [] },
      timestamp: new Date().toISOString(),
    };
  },
};

export default rewardService;