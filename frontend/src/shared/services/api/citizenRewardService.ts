import apiClient from './client';

export interface RewardItemResponse {
  itemId: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl: string;
  isActive: boolean;
}

export interface RewardTransactionResponse {
  transactionId: string;
  citizenUserId: string;
  citizenName: string;
  transactionType: string; // EARN | REDEEM
  pointsAmount: number;
  description: string;
  referenceId: string;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  totalPoints: number;
}

const unwrap = (res: any) => res?.data ?? res;

export const citizenRewardService = {
  /** GET /rewards/points/me */
  async getMyPoints(): Promise<number> {
    const res: any = await apiClient.get('/rewards/points/me');
    const data = unwrap(res);
    return typeof data === 'number' ? data : (data?.points ?? 0);
  },

  /** GET /rewards/transactions/me */
  async getMyTransactions(page = 0, size = 20): Promise<RewardTransactionResponse[]> {
    const res: any = await apiClient.get('/rewards/transactions/me', { params: { page, size } });
    const data = unwrap(res);
    if (data?.content) return data.content;
    return Array.isArray(data) ? data : [];
  },

  /** GET /rewards/leaderboard?limit=10 */
  async getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
    const res: any = await apiClient.get('/rewards/leaderboard', { params: { limit } });
    const data = unwrap(res);
    return Array.isArray(data) ? data : [];
  },

  /** GET /reward-items/available */
  async getAvailableItems(): Promise<RewardItemResponse[]> {
    const res: any = await apiClient.get('/reward-items/available');
    const data = unwrap(res);
    if (data?.content) return data.content;
    return Array.isArray(data) ? data : [];
  },

  /** POST /reward-items/redeem : body { itemId } */
  async redeemItem(itemId: string): Promise<void> {
    await apiClient.post('/reward-items/redeem', { itemId });
  },
};
