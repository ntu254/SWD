// Reward Exchange Service Types & Interfaces
// For users to browse and exchange rewards using their points

export type RewardCategory = 'VOUCHER' | 'GIFT' | 'DISCOUNT' | 'SERVICE' | 'OTHER';

export type RewardStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'EXPIRED';

export type ExchangeStatus = 'PENDING' | 'APPROVED' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';

export interface AvailableReward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  category: RewardCategory;
  status: RewardStatus;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPointsInfo {
  userId: string;
  currentPoints: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Date;
}

export interface ExchangeRequest {
  rewardId: string;
  quantity?: number;
  deliveryAddress?: string;
  notes?: string;
}

export interface ExchangeHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImageUrl?: string;
  pointsSpent: number;
  quantity: number;
  status: ExchangeStatus;
  deliveryAddress?: string;
  notes?: string;
  exchangedAt: Date;
  processedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  rejectionReason?: string;
}

export interface RewardFilters {
  category?: RewardCategory;
  minPoints?: number;
  maxPoints?: number;
  search?: string;
  sortBy?: 'name' | 'pointsCost' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedRewards {
  content: AvailableReward[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ExchangeResponse {
  success: boolean;
  data?: ExchangeHistory;
  message: string;
  remainingPoints?: number;
}
