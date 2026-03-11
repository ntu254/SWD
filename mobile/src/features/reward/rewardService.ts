import { ApiResponse, PageResponse } from "../../shared/types/api";
import {
  LeaderboardEntry,
  RewardItem,
  RewardTransaction,
} from "../../shared/types/domain";
import { apiClient } from "../../shared/utils/apiClient";

interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

const toPageResponse = <T>(page: SpringPage<T>): PageResponse<T> => ({
  content: page.content ?? [],
  pageNumber: page.number ?? 0,
  pageSize: page.size ?? 10,
  totalElements: page.totalElements ?? 0,
  totalPages: page.totalPages ?? 0,
  first: page.first ?? true,
  last: page.last ?? true,
});

export const rewardService = {
  getMyPoints: async (): Promise<number> => {
    const { data } =
      await apiClient.get<ApiResponse<number>>("/rewards/points/me");
    return data.data ?? 0;
  },

  getMyTransactions: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<RewardTransaction>> => {
    const { data } = await apiClient.get<
      ApiResponse<SpringPage<RewardTransaction>>
    >("/rewards/transactions/me", {
      params,
    });
    return toPageResponse(data.data);
  },

  getAvailableItems: async (): Promise<RewardItem[]> => {
    const { data } = await apiClient.get<ApiResponse<RewardItem[]>>(
      "/reward-items/available",
    );
    return data.data ?? [];
  },

  redeemItem: async (itemId: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>("/reward-items/redeem", { itemId });
  },

  getLeaderboard: async (params?: {
    areaId?: string;
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    const { data } = await apiClient.get<ApiResponse<LeaderboardEntry[]>>(
      "/rewards/leaderboard",
      {
        params,
      },
    );
    return data.data ?? [];
  },
};
