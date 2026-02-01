import axios from 'axios';
import type {
  AvailableReward,
  UserPointsInfo,
  ExchangeRequest,
  ExchangeHistory,
  RewardFilters,
  PaginatedRewards,
  ExchangeResponse,
} from '../types';

// Tạo apiClient riêng cho Reward Exchange Service
// Khi có backend thực, chỉ cần thay đổi baseURL
const apiClient = axios.create({
  baseURL: 'https://697f2d1dd1548030ab655722.mockapi.io/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Có thể thêm interceptor khi cần
// apiClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

/**
 * Reward Exchange Service
 * API service for users to browse and exchange rewards
 */
export const rewardExchangeService = {
  /**
   * Get available rewards (active and in-stock)
   */
  async getAvailableRewards(
    filters?: RewardFilters,
    page: number = 0,
    size: number = 12
  ): Promise<PaginatedRewards> {
    // MockAPI không hỗ trợ query params phức tạp
    // Khi có backend thực, có thể thêm lại filters
    const response = await apiClient.get('/rewards');

    // Client-side filtering để demo
    let rewards = response.data as AvailableReward[];

    if (filters?.category) {
      rewards = rewards.filter(r => r.category === filters.category);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      rewards = rewards.filter(
        r => r.name.toLowerCase().includes(search) || r.description.toLowerCase().includes(search)
      );
    }
    if (filters?.minPoints) {
      rewards = rewards.filter(r => r.pointsRequired >= filters.minPoints!);
    }
    if (filters?.maxPoints) {
      rewards = rewards.filter(r => r.pointsRequired <= filters.maxPoints!);
    }

    // Sorting
    if (filters?.sortBy) {
      rewards.sort((a, b) => {
        let comparison = 0;
        if (filters.sortBy === 'pointsRequired') {
          comparison = a.pointsRequired - b.pointsRequired;
        } else if (filters.sortBy === 'name') {
          comparison = a.name.localeCompare(b.name);
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Pagination
    const total = rewards.length;
    const start = page * size;
    const paginatedRewards = rewards.slice(start, start + size);

    return {
      content: paginatedRewards,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      size,
      number: page,
    };
  },

  /**
   * Get reward by ID
   */
  async getRewardById(userId: string): Promise<AvailableReward> {
    const response = await apiClient.get(`/rewards/${userId}`);
    return response.data;
  },

  /**
   * Get current user's points information
   */
  async getUserPoints(): Promise<UserPointsInfo> {
    // MockAPI trả về array, lấy phần tử đầu tiên
    const response = await apiClient.get('/user_points');
    const userPointsArray = response.data as UserPointsInfo[];
    return userPointsArray[0]; // Lấy user đầu tiên
  },

  /**
   * Exchange reward (create exchange request)
   */
  async exchangeReward(request: ExchangeRequest): Promise<ExchangeResponse> {
    // MockAPI: Tạo exchange mới
    const response = await apiClient.post('/exchanges', {
      ...request,
      status: 'PENDING',
      exchangeDate: new Date().toISOString(),
    });

    // Cập nhật user points (trừ points)
    const userPoints = await this.getUserPoints();
    const totalCost = request.pointsSpent;

    // Lấy id từ user_points để update
    const allUserPoints = await apiClient.get('/user_points');
    const userPointsWithId = allUserPoints.data[0];

    await apiClient.put(`/user_points/${userPointsWithId.id}`, {
      ...userPoints,
      currentPoints: userPoints.currentPoints - totalCost,
      totalSpent: userPoints.totalSpent + totalCost,
    });

    return {
      success: true,
      exchangeId: response.data.id,
      pointsSpent: totalCost,
      remainingPoints: userPoints.currentPoints - totalCost,
    };
  },

  /**
   * Get user's exchange history
   */
  async getExchangeHistory(
    page: number = 0,
    size: number = 10
  ): Promise<{ content: ExchangeHistory[]; totalElements: number; totalPages: number }> {
    const response = await apiClient.get('/exchanges');
    const exchanges = response.data as ExchangeHistory[];

    // Pagination
    const total = exchanges.length;
    const start = page * size;
    const paginatedExchanges = exchanges.slice(start, start + size);

    return {
      content: paginatedExchanges,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  },

  /**
   * Get specific exchange details
   */
  async getExchangeById(id: string): Promise<ExchangeHistory> {
    const response = await apiClient.get(`/exchanges/${id}`);
    return response.data;
  },

  /**
   * Cancel exchange request (only if pending)
   */
  async cancelExchange(id: string): Promise<void> {
    const exchange = await this.getExchangeById(id);
    await apiClient.put(`/exchanges/${id}`, {
      ...exchange,
      status: 'CANCELLED',
    });
  },
};

export default rewardExchangeService;
