import { UserRole } from '../store/authStore';

export interface UserResponse {
    userId: string;
    firstName: string;
    lastName: string;
    displayName?: string | null;
    fullName?: string | null;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    role: UserRole;
}

export interface WasteType {
    typeId: string;
    name: string;
    description?: string | null;
    pointsPerKg: number;
    isRecyclable: boolean;
    isActive: boolean;
}

export interface ServiceArea {
    areaId: string;
    name: string;
    wardCode?: string | null;
    districtCode?: string | null;
    city?: string | null;
    geoPolygon?: string | null;
    isActive?: boolean;
}

export interface WasteReport {
    reportId: string;
    citizenUserId: string;
    citizenName?: string | null;
    areaId?: string | null;
    areaName?: string | null;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    noteText?: string | null;
    photoUrl?: string | null;
    wasteTypeId?: string | null;
    wasteTypeName?: string | null;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CitizenProfile {
    userId: string;
    fullName?: string | null;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    defaultAreaId?: string | null;
    defaultAreaName?: string | null;
    addressText?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    totalPoints?: number | null;
}

export interface CollectorProfile {
    userId: string;
    fullName?: string | null;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    assignedAreaId?: string | null;
    assignedAreaName?: string | null;
    vehicleType?: string | null;
    vehiclePlate?: string | null;
    isAvailable?: boolean | null;
    currentLat?: number | null;
    currentLng?: number | null;
    averageRating?: number | null;
    totalVisits?: number | null;
    status?: string | null;
}

export interface RewardItem {
    itemId: string;
    name: string;
    description?: string | null;
    pointsCost: number;
    stock: number;
    imageUrl?: string | null;
    isActive: boolean;
}

export interface RewardTransaction {
    transactionId: string;
    citizenUserId: string;
    citizenName?: string | null;
    transactionType: string;
    pointsAmount: number;
    description?: string | null;
    referenceId?: string | null;
    createdAt?: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    fullName?: string | null;
    totalPoints: number;
}

export interface Complaint {
    complaintId: string;
    createdByUserId: string;
    createdByUserName?: string | null;
    title: string;
    content: string;
    category: ComplaintCategory;
    priority: ComplaintPriority;
    status: ComplaintStatus;
    adminResponse?: string | null;
    reportId?: string | null;
    visitId?: string | null;
    createdAt?: string;
}

export type ComplaintCategory =
    | 'BUG'
    | 'FEATURE'
    | 'POINTS_ERROR'
    | 'COLLECTION_ISSUE'
    | 'SERVICE_ISSUE'
    | 'OTHER';

export type ComplaintPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type ComplaintStatus = 'Pending' | 'In_Progress' | 'Resolved' | 'Rejected';

export type CollectorTaskStatus =
    | 'ASSIGNED'
    | 'ON_THE_WAY'
    | 'COLLECTED'
    | 'FAILED'
    | 'CANCELLED'
    | 'COMPLETED';

export interface CollectorTask {
    id: string;
    collectorId: string;
    reportId?: string | null;
    enterpriseId?: string | null;
    status: CollectorTaskStatus;
    note?: string | null;
    collectorProofImageUrl?: string | null;
    assignedAt?: string | null;
    acceptedAt?: string | null;
    onWayAt?: string | null;
    collectedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
}

export interface JobHistory {
    id: string;
    reportId?: string | null;
    enterpriseId?: string | null;
    status: CollectorTaskStatus;
    note?: string | null;
    collectorProofImageUrl?: string | null;
    assignedAt?: string | null;
    collectedAt?: string | null;
    createdAt?: string | null;
    completionTimeMinutes?: number | null;
}

export interface PerformanceSummary {
    totalJobsAssigned: number;
    totalJobsCompleted: number;
    totalJobsFailed: number;
    totalJobsCancelled: number;
    completionRate: number;
    averageCompletionTimeMinutes?: number | null;
}

export interface CollectorKpiDaily {
    kpiId: string;
    collectorUserId: string;
    collectorName?: string | null;
    areaId?: string | null;
    areaName?: string | null;
    kpiDate: string;
    minWeightKg: number;
    minVisits: number;
    actualWeightKg: number;
    actualVisits: number;
    weightProgress: number;
    visitsProgress: number;
    status: string;
}
