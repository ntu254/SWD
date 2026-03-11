// ===================== ENTERPRISE =====================
export interface EnterpriseResponse {
  id: string;
  name: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// ===================== TASK =====================
export type TaskStatus =
  | 'PENDING'
  | 'PENDING_ENTERPRISE_APPROVAL'
  | 'PENDING_APPROVAL'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'ASSIGNED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export interface TaskResponse {
  id: string;
  taskId?: string; // fallback when @JsonProperty("id") not active
  wasteReportId: string;
  enterpriseId: string;
  status: TaskStatus;
  scheduledDate: string;
  priority: string;
  notes: string;
  rejectionReason: string | null;
  citizenName: string;
  citizenPhone: string;
  address: string;
  areaName: string;
  latitude: number;
  longitude: number;
  wasteType: string;
  description: string;
  photoUrl: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignmentResponse {
  id: string;
  taskId: string;
  collectorUserId: string;
  collectorName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  assignedAt: string;
  completedAt: string | null;
}

export interface AssignTaskRequest {
  taskId: string;
  collectorUserId: string;
}

// ===================== COLLECTOR =====================
export interface CollectorResponse {
  id: number;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  enabled: boolean;
  createdAt: string;
}

export interface CreateCollectorRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

// ===================== ANALYTICS =====================
export interface EnterpriseSummaryDTO {
  totalReports: number;
  totalCollected: number;
  totalWeight: number;
  totalRecycled: number;
  avgProcessingTime: number;
  collectionRate: number;
}

export interface WasteTypeSummaryDTO {
  wasteTypeId: string;
  wasteTypeName: string;
  totalReports: number;
  totalWeight: number;
  totalRecycled: number;
}

export interface AreaSummaryDTO {
  areaId: string;
  areaName: string;
  totalReports: number;
  totalCollected: number;
  totalWeight: number;
}

export interface DailyStatDTO {
  date: string;
  totalReports: number;
  totalCollected: number;
  totalWeight: number;
}

export interface EnterpriseAnalyticsResponse {
  summary: EnterpriseSummaryDTO;
  byWasteType: WasteTypeSummaryDTO[];
  byArea: AreaSummaryDTO[];
  dailyStats: DailyStatDTO[];
}

// ===================== REWARD RULES =====================
export interface RewardRuleResponse {
  ruleId: string;
  wasteTypeId: string;
  wasteTypeName: string;
  sortingLevel: string;
  pointsFixed: number | null;
  pointsPerKg: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string | null;
}

export interface CreateRewardRuleRequest {
  wasteTypeId: string;
  sortingLevel: string;
  pointsFixed?: number;
  pointsPerKg: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

// ===================== COMPLAINT =====================
export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
export type ComplaintCategory =
  | 'COLLECTOR_BEHAVIOR'
  | 'SERVICE_QUALITY'
  | 'MISSED_COLLECTION'
  | 'WRONG_CLASSIFICATION'
  | 'OTHER';
export type ComplaintPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ComplaintResponse {
  id: string;
  citizenId: string;
  citizenName: string;
  collectorId: string | null;
  collectorName: string | null;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title: string;
  description: string;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
}

// ===================== FILTERS =====================
export interface TaskFilters {
  status?: TaskStatus;
  page: number;
  size: number;
}

export interface AnalyticsDateRange {
  startDate: string;
  endDate: string;
}

// ===================== PAGINATION =====================
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
