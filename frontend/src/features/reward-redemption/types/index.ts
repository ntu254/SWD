export interface Reward {
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

export enum RewardCategory {
  VOUCHER = 'VOUCHER',
  GIFT = 'GIFT',
  DISCOUNT = 'DISCOUNT',
  SERVICE = 'SERVICE',
  OTHER = 'OTHER',
}

export enum RewardStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  EXPIRED = 'EXPIRED',
}

export interface CreateRewardDto {
  name: string;
  description: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  category: RewardCategory;
  status: RewardStatus;
  validFrom?: Date;
  validUntil?: Date;
}

export interface UpdateRewardDto extends Partial<CreateRewardDto> {
  id: string;
}

export interface RewardFilters {
  category?: RewardCategory;
  status?: RewardStatus;
  minPoints?: number;
  maxPoints?: number;
  search?: string;
}

export interface RedemptionHistory {
  id: string;
  rewardId: string;
  rewardName: string;
  userId: string;
  userName: string;
  pointsSpent: number;
  redeemedAt: Date;
  status: RedemptionStatus;
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
