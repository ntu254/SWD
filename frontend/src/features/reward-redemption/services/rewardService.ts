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

const MOCK_API_URL = 'https://69660067f6de16bde44bc9d6.mockapi.io/Reward';

// Helper function to create ApiResponse
const createApiResponse = <T>(data: T, success: boolean, message?: string): ApiResponse<T> => ({
  success,
  message: message || (success ? 'Success' : 'Error'),
  data,
  timestamp: new Date().toISOString(),
});

// Helper to transform MockAPI response to Reward interface
const transformReward = (item: any, index?: number): Reward => ({
  id: item.id || String(index !== undefined ? index + 1 : Date.now()),
  name: item.name || '',
  description: item.description || '',
  pointsCost: item.pointsCost || 0,
  stock: item.stock || 0,
  imageUrl: item.imageUrl,
  category: item.category || 'OTHER',
  status: item.status || 'ACTIVE',
  validFrom: item.validFrom ? new Date(item.validFrom) : undefined,
  validUntil: item.validUntil ? new Date(item.validUntil) : undefined,
  createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
  updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
});

export const rewardService = {
  /**
   * Get all rewards with optional filters
   */
  getAllRewards: async (filters?: RewardFilters): Promise<ApiResponse<Reward[]>> => {
    try {
      const response = await fetch(MOCK_API_URL);
      let rawData = await response.json();

      // Transform data to match Reward interface
      let data: Reward[] = rawData.map((item: any, index: number) => transformReward(item, index));

      // Apply filters
      if (filters?.category) {
        data = data.filter((r: Reward) => r.category === filters.category);
      }
      if (filters?.status) {
        data = data.filter((r: Reward) => r.status === filters.status);
      }
      if (filters?.minPoints) {
        data = data.filter((r: Reward) => r.pointsCost >= filters.minPoints!);
      }
      if (filters?.maxPoints) {
        data = data.filter((r: Reward) => r.pointsCost <= filters.maxPoints!);
      }
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        data = data.filter((r: Reward) => 
          r.name.toLowerCase().includes(searchLower) || 
          r.description.toLowerCase().includes(searchLower)
        );
      }

      return createApiResponse(data, true, 'Rewards fetched successfully');
    } catch (error) {
      return createApiResponse([], false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Get a single reward by ID
   */
  getRewardById: async (id: string): Promise<ApiResponse<Reward>> => {
    try {
      // MockAPI doesn't have individual items by ID based on the structure
      // So we fetch all and find the one with matching index
      const response = await fetch(MOCK_API_URL);
      const rawData = await response.json();
      const data: Reward[] = rawData.map((item: any, index: number) => transformReward(item, index));
      const reward = data.find(r => r.id === id) || data[parseInt(id) - 1];
      
      if (!reward) {
        return createApiResponse(null as any, false, 'Reward not found');
      }
      
      return createApiResponse(reward, true, 'Reward fetched successfully');
    } catch (error) {
      return createApiResponse(null as any, false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Create a new reward
   */
  createReward: async (data: CreateRewardDto): Promise<ApiResponse<Reward>> => {
    try {
      const payload = {
        name: data.name,
        description: data.description,
        pointsCost: data.pointsCost,
        stock: data.stock,
        imageUrl: data.imageUrl,
        category: data.category,
        status: data.status,
        validFrom: data.validFrom?.toISOString(),
        validUntil: data.validUntil?.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(MOCK_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const rawResult = await response.json();
      const result = transformReward(rawResult);
      
      return createApiResponse(result, true, 'Reward created successfully');
    } catch (error) {
      return createApiResponse(null as any, false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Update an existing reward
   */
  updateReward: async (data: UpdateRewardDto): Promise<ApiResponse<Reward>> => {
    const { id, ...updateData } = data;
    try {
      // First, get all rewards to find the correct index
      const getAllResponse = await fetch(MOCK_API_URL);
      const allRewards = await getAllResponse.json();
      const rewardIndex = allRewards.findIndex((r: any, idx: number) => 
        String(idx + 1) === id
      );

      if (rewardIndex === -1) {
        return createApiResponse(null as any, false, 'Reward not found');
      }

      const payload = {
        ...allRewards[rewardIndex],
        ...updateData,
        validFrom: updateData.validFrom?.toISOString(),
        validUntil: updateData.validUntil?.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // MockAPI uses index-based ID, so we update using the index
      const response = await fetch(`${MOCK_API_URL}/${rewardIndex + 1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const rawResult = await response.json();
      const result = transformReward(rawResult, rewardIndex);
      
      return createApiResponse(result, true, 'Reward updated successfully');
    } catch (error) {
      return createApiResponse(null as any, false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Delete a reward
   */
  deleteReward: async (id: string): Promise<ApiResponse<void>> => {
    try {
      // First, get all rewards to find the correct index
      const getAllResponse = await fetch(MOCK_API_URL);
      const allRewards = await getAllResponse.json();
      const rewardIndex = allRewards.findIndex((r: any, idx: number) => 
        String(idx + 1) === id
      );

      if (rewardIndex === -1) {
        return createApiResponse(undefined as any, false, 'Reward not found');
      }

      await fetch(`${MOCK_API_URL}/${rewardIndex + 1}`, {
        method: 'DELETE',
      });
      
      return createApiResponse(undefined as any, true, 'Reward deleted successfully');
    } catch (error) {
      return createApiResponse(undefined as any, false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Update reward stock
   */
  updateStock: async (id: string, stock: number): Promise<ApiResponse<Reward>> => {
    try {
      // First, get all rewards to find the correct index
      const getAllResponse = await fetch(MOCK_API_URL);
      const allRewards = await getAllResponse.json();
      const rewardIndex = allRewards.findIndex((r: any, idx: number) => 
        String(idx + 1) === id
      );

      if (rewardIndex === -1) {
        return createApiResponse(null as any, false, 'Reward not found');
      }

      const payload = {
        ...allRewards[rewardIndex],
        stock,
        updatedAt: new Date().toISOString(),
      };

      const response = await fetch(`${MOCK_API_URL}/${rewardIndex + 1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const rawData = await response.json();
      const data = transformReward(rawData, rewardIndex);
      
      return createApiResponse(data, true, 'Stock updated successfully');
    } catch (error) {
      return createApiResponse(null as any, false, error instanceof Error ? error.message : 'Unknown error');
    }
  },

  /**
   * Get redemption history
   */
  getRedemptionHistory: async (): Promise<ApiResponse<RedemptionHistory[]>> => {
    // MockAPI doesn't have redemption history, return empty array
    return createApiResponse([], true, 'No redemption history available');
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
    // MockAPI doesn't have stats, return default values
    return createApiResponse(
      {
        totalRedemptions: 0,
        totalPointsSpent: 0,
        popularRewards: [],
      },
      true,
      'No statistics available'
    );
  },
};

export default rewardService;
