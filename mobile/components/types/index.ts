// Waste Types
export interface WasteType {
  wasteTypeId: string;
  name: string;
  description?: string;
  isRecyclable: boolean;
  isActive: boolean;
  color: string;
  icon: string;
}

// Service Areas
export interface ServiceArea {
  areaId: string;
  name: string;
  geoBoundaryWkt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Waste Reports
export type ReportStatus = 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'COLLECTED' | 'REJECTED';

export interface WasteReport {
  reportId: string;
  reporterUserId: string;
  reporterName?: string;
  reporterAvatar?: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  wasteTypeColor?: string;
  areaId?: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  description?: string;
  reportPhotoUrl?: string;
  status: ReportStatus;
  requestedPickupTime?: string;
  createdAt: string;
}

// Tasks
export type TaskStatus =
  | 'PENDING'
  | 'PENDING_ENTERPRISE_APPROVAL'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'COLLECTED'
  | 'FAILED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export interface Task {
  taskId: string;
  reportId?: string;
  enterpriseUserId: string;
  enterpriseName?: string;
  createdByUserId: string;
  areaId?: string;
  areaName?: string;
  status: TaskStatus;
  priority?: string;
  scheduledDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  report?: WasteReport;
}

// Task Assignments
export type AssignmentStatus =
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'COLLECTED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'UNASSIGNED';

export interface TaskAssignment {
  assignmentId: string;
  taskId: string;
  collectorUserId: string;
  collectorName?: string;
  collectorAvatar?: string;
  status: AssignmentStatus;
  assignedAt?: string;
  acceptedAt?: string;
  unassignedAt?: string;
  collectorNote?: string;
  task?: Task;
}

// Collection Visits
export interface CollectionVisit {
  visitId: string;
  taskId: string;
  collectorUserId: string;
  collectorName?: string;
  visitStatus?: string;
  collectorNote?: string;
  visitedAt?: string;
  evidencePhotos?: EvidencePhoto[];
  wasteItems?: VisitWasteItem[];
}

export interface EvidencePhoto {
  photoId: string;
  visitId: string;
  photoUrl: string;
  note?: string;
  takenAt?: string;
}

export interface VisitWasteItem {
  itemId: string;
  visitId: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  weightKg?: number;
  sortingLevel?: string;
  contaminationNote?: string;
}

// Collector KPI
export type KpiStatus = 'PENDING' | 'MET' | 'NOT_MET';

export interface CollectorKpiDaily {
  kpiId: string;
  collectorUserId: string;
  collectorName?: string;
  areaId: string;
  areaName?: string;
  kpiDate: string;
  minVisits: number;
  actualVisits: number;
  minWeightKg: number;
  actualWeightKg: number;
  status: KpiStatus;
  updatedAt?: string;
}

// Enterprise Capabilities
export interface EnterpriseCapability {
  capabilityId: string;
  enterpriseUserId: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  serviceAreaId: string;
  serviceAreaName?: string;
  dailyCapacityKg: number;
  usedCapacityKg?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// Complaints
export type ComplaintCategory =
  | 'BUG'
  | 'FEATURE'
  | 'POINTS_ERROR'
  | 'COLLECTION_ISSUE'
  | 'SERVICE_ISSUE'
  | 'OTHER';

export type ComplaintStatus = 'Pending' | 'In_Progress' | 'Resolved' | 'Rejected';
export type ComplaintPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface Complaint {
  complaintId: string;
  createdByUserId: string;
  createdByName?: string;
  createdByAvatar?: string;
  reportId?: string;
  visitId?: string;
  rewardTransactionId?: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  title?: string;
  content: string;
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
  updatedAt?: string;
}

// Reward Rules
export interface CitizenRewardRule {
  ruleId: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  pointsPerKg: number;
  pointsFixed?: number;
  sortingLevel: string;
  isActive: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

// Reward Items
export interface RewardItem {
  itemId: string;
  name: string;
  description?: string;
  pointsCost: number;
  stock: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Reward Transactions
export interface RewardTransaction {
  transactionId: string;
  citizenUserId: string;
  citizenName?: string;
  pointsDelta: number;
  reasonCode?: string;
  visitId?: string;
  complaintId?: string;
  createdByAdminId?: string;
  createdAt?: string;
}

// Notifications
export type NotificationType = 'General' | 'Maintenance' | 'Update' | 'Promotion' | 'Alert';
export type NotificationTarget = 'All' | 'Citizen' | 'Collector' | 'Enterprise';

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: NotificationType;
  priority: ComplaintPriority;
  targetAudience: NotificationTarget;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdBy: string;
  createdAt?: string;
}

// System Settings
export interface SystemSetting {
  settingKey: string;
  settingValue: string;
  dataType?: string;
  description?: string;
}

// Leaderboard
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  points: number;
  reportsCount: number;
  areaName?: string;
}

// AI Classification Result
export interface AIClassificationResult {
  wasteTypeId: string;
  wasteTypeName: string;
  confidence: number;
  color: string;
  description: string;
}
