import { useState, useCallback, useEffect } from 'react';
import { rewardExchangeService } from '../services/rewardExchangeService';
import type {
  AvailableReward,
  UserPointsInfo,
  ExchangeRequest,
  ExchangeHistory,
  RewardFilters,
  ExchangeResponse,
} from '../types';

export const useRewardExchange = () => {
  const [rewards, setRewards] = useState<AvailableReward[]>([]);
  const [userPoints, setUserPoints] = useState<UserPointsInfo | null>(null);
  const [exchangeHistory, setExchangeHistory] = useState<ExchangeHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  /**
   * Fetch available rewards
   */
  const fetchRewards = useCallback(
    async (filters?: RewardFilters, page: number = 0, size: number = 12) => {
      try {
        setLoading(true);
        setError(null);
        const data = await rewardExchangeService.getAvailableRewards(filters, page, size);
        setRewards(data.content);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch rewards');
        console.error('Fetch rewards error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Fetch user points
   */
  const fetchUserPoints = useCallback(async () => {
    try {
      const data = await rewardExchangeService.getUserPoints();
      setUserPoints(data);
    } catch (err: any) {
      console.error('Fetch user points error:', err);
      // Don't set error state for this, just log it
    }
  }, []);

  /**
   * Fetch exchange history
   */
  const fetchExchangeHistory = useCallback(async (page: number = 0, size: number = 10) => {
    try {
      setLoading(true);
      const data = await rewardExchangeService.getExchangeHistory(page, size);
      setExchangeHistory(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exchange history');
      console.error('Fetch exchange history error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exchange a reward
   */
  const exchangeReward = useCallback(
    async (request: ExchangeRequest): Promise<ExchangeResponse> => {
      try {
        setLoading(true);
        setError(null);
        const response = await rewardExchangeService.exchangeReward(request);

        // Update user points if available
        if (response.remainingPoints !== undefined && userPoints) {
          setUserPoints({
            ...userPoints,
            currentPoints: response.remainingPoints,
            totalSpent: userPoints.totalSpent + (response.data?.pointsSpent || 0),
          });
        } else {
          // Refetch points to get latest
          await fetchUserPoints();
        }

        return response;
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to exchange reward');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userPoints, fetchUserPoints]
  );

  /**
   * Cancel an exchange
   */
  const cancelExchange = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);
        await rewardExchangeService.cancelExchange(id);
        // Refresh exchange history
        await fetchExchangeHistory();
        // Refresh user points
        await fetchUserPoints();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to cancel exchange');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchExchangeHistory, fetchUserPoints]
  );

  return {
    rewards,
    userPoints,
    exchangeHistory,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchRewards,
    fetchUserPoints,
    fetchExchangeHistory,
    exchangeReward,
    cancelExchange,
    setCurrentPage,
  };
};

export default useRewardExchange;
