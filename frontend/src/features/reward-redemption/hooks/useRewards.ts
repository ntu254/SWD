import { useState, useEffect, useCallback } from 'react';
import { rewardService } from '../services/rewardService';
import type {
  Reward,
  CreateRewardDto,
  UpdateRewardDto,
  RewardFilters,
  RedemptionHistory,
} from '../types';

interface UseRewardsReturn {
  rewards: Reward[];
  loading: boolean;
  error: string | null;
  fetchRewards: (filters?: RewardFilters) => Promise<void>;
  createReward: (data: CreateRewardDto) => Promise<void>;
  updateReward: (data: UpdateRewardDto) => Promise<void>;
  deleteReward: (id: string) => Promise<void>;
  updateStock: (id: string, stock: number) => Promise<void>;
}

/**
 * Custom hook for managing rewards
 * Provides CRUD operations and state management for rewards
 */
export const useRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all rewards with optional filters
   */
  const fetchRewards = useCallback(async (filters?: RewardFilters) => {
    setLoading(true);
    setError(null);
    try {
      const response = await rewardService.getAllRewards(filters);
      setRewards(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch rewards');
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new reward
   */
  const createReward = useCallback(
    async (data: CreateRewardDto) => {
      setLoading(true);
      setError(null);
      try {
        await rewardService.createReward(data);
        await fetchRewards(); // Refresh the list
      } catch (err: any) {
        setError(err?.message || 'Failed to create reward');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  /**
   * Update an existing reward
   */
  const updateReward = useCallback(
    async (data: UpdateRewardDto) => {
      setLoading(true);
      setError(null);
      try {
        await rewardService.updateReward(data);
        await fetchRewards(); // Refresh the list
      } catch (err: any) {
        setError(err?.message || 'Failed to update reward');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  /**
   * Delete a reward
   */
  const deleteReward = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await rewardService.deleteReward(id);
        await fetchRewards(); // Refresh the list
      } catch (err: any) {
        setError(err?.message || 'Failed to delete reward');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  /**
   * Update reward stock
   */
  const updateStock = useCallback(
    async (id: string, stock: number) => {
      setLoading(true);
      setError(null);
      try {
        await rewardService.updateStock(id, stock);
        await fetchRewards(); // Refresh the list
      } catch (err: any) {
        setError(err?.message || 'Failed to update stock');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchRewards]
  );

  return {
    rewards,
    loading,
    error,
    fetchRewards,
    createReward,
    updateReward,
    deleteReward,
    updateStock,
  };
};

interface UseRedemptionHistoryReturn {
  history: RedemptionHistory[];
  loading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
}

/**
 * Custom hook for redemption history
 */
export const useRedemptionHistory = (): UseRedemptionHistoryReturn => {
  const [history, setHistory] = useState<RedemptionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rewardService.getRedemptionHistory();
      setHistory(response.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch redemption history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    history,
    loading,
    error,
    fetchHistory,
  };
};
