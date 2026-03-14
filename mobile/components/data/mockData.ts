import { Colors } from '@/constants/colors';
import type {
  WasteType, ServiceArea, WasteReport, Task, TaskAssignment,
  CollectorKpiDaily, EnterpriseCapability, Complaint, CitizenRewardRule,
  RewardItem, RewardTransaction, Notification, LeaderboardEntry
} from '@/types';

export const wasteTypes: WasteType[] = [
  { wasteTypeId: '1', name: 'Rác hữu cơ', description: 'Thực phẩm thừa, lá cây, vỏ trái cây', isRecyclable: false, isActive: true, color: Colors.waste.organic, icon: 'Leaf' },
  { wasteTypeId: '2', name: 'Nhựa', description: 'Chai nhựa, túi nilon, hộp nhựa', isRecyclable: true, isActive: true, color: Colors.waste.plastic, icon: 'Box' },
  { wasteTypeId: '3', name: 'Giấy', description: 'Báo cũ, hộp giấy, tài liệu', isRecyclable: true, isActive: true, color: Colors.waste.paper, icon: 'FileText' },
  { wasteTypeId: '4', name: 'Kim loại', description: 'Lon nhôm, sắt thép phế liệu', isRecyclable: true, isActive: true, color: Colors.waste.metal, icon: 'CircleDot' },
  { wasteTypeId: '5', name: 'Thủy tinh', description: 'Chai lọ thủy tinh', isRecyclable: true, isActive: true, color: Colors.waste.glass, icon: 'Wine' },
  { wasteTypeId: '6', name: 'Rác điện tử', description: 'Pin, điện thoại cũ, thiết bị điện', isRecyclable: true, isActive: true, color: Colors.waste.electronic, icon: 'Smartphone' },
  { wasteTypeId: '7', name: 'Rác nguy hại', description: 'Thuốc trừ sâu, sơn, hóa chất', isRecyclable: false, isActive: true, color: Colors.waste.hazardous, icon: 'AlertTriangle' },
];

export const serviceAreas: ServiceArea[] = [
  { areaId: '1', name: 'Quận 1', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { areaId: '2', name: 'Quận 2', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { areaId: '3', name: 'Quận 3', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { areaId: '4', name: 'Quận 7', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { areaId: '5', name: 'Bình Thạnh', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { areaId: '6', name: 'Gò Vấp', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
];

export const wasteReports: WasteReport[] = [
  {
    reportId: '1',
    reporterUserId: '1',
    reporterName: 'Nguyễn Văn A',
    reporterAvatar: 'https://i.pravatar.cc/150?u=1',
    wasteTypeId: '2',
    wasteTypeName: 'Nhựa',
    wasteTypeColor: Colors.waste.plastic,
    areaId: '1',
    areaName: 'Quận 1',
    latitude: 10.7758,
    longitude: 106.7000,
    description: 'Nhiều chai nhựa cần thu gom',
    reportPhotoUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400',
    status: 'PENDING',
    createdAt: '2024-03-14T08:30:00Z'
  },
  {
    reportId: '2',
    reporterUserId: '1',
    reporterName: 'Nguyễn Văn A',
    reporterAvatar: 'https://i.pravatar.cc/150?u=1',
    wasteTypeId: '1',
    wasteTypeName: 'Rác hữu cơ',
    wasteTypeColor: Colors.waste.organic,
    areaId: '2',
    areaName: 'Quận 2',
    latitude: 10.7900,
    longitude: 106.7200,
    description: 'Rác thực phẩm thừa sau chợ',
    reportPhotoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    status: 'ACCEPTED',
    createdAt: '2024-03-13T15:20:00Z'
  },
  {
    reportId: '3',
    reporterUserId: '5',
    reporterName: 'Lê Thị C',
    reporterAvatar: 'https://i.pravatar.cc/150?u=5',
    wasteTypeId: '6',
    wasteTypeName: 'Rác điện tử',
    wasteTypeColor: Colors.waste.electronic,
    areaId: '3',
    areaName: 'Quận 3',
    latitude: 10.7800,
    longitude: 106.6800,
    description: 'Pin và điện thoại cũ',
    reportPhotoUrl: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=400',
    status: 'COLLECTED',
    createdAt: '2024-03-10T09:00:00Z'
  },
  {
    reportId: '4',
    reporterUserId: '6',
    reporterName: 'Phạm Văn D',
    reporterAvatar: 'https://i.pravatar.cc/150?u=6',
    wasteTypeId: '7',
    wasteTypeName: 'Rác nguy hại',
    wasteTypeColor: Colors.waste.hazardous,
    areaId: '4',
    areaName: 'Quận 7',
    latitude: 10.7300,
    longitude: 106.7000,
    description: 'Sơn cũ cần xử lý đặc biệt',
    reportPhotoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    status: 'ASSIGNED',
    createdAt: '2024-03-12T11:30:00Z'
  },
];

export const tasks: Task[] = [
  {
    taskId: '1',
    reportId: '2',
    enterpriseUserId: '3',
    enterpriseName: 'Công Ty Tái Chế Xanh',
    createdByUserId: '3',
    areaId: '2',
    areaName: 'Quận 2',
    status: 'IN_PROGRESS',
    priority: 'Normal',
    scheduledDate: '2024-03-15',
    createdAt: '2024-03-13T16:00:00Z',
    updatedAt: '2024-03-13T16:00:00Z',
  },
  {
    taskId: '2',
    reportId: '4',
    enterpriseUserId: '3',
    enterpriseName: 'Công Ty Tái Chế Xanh',
    createdByUserId: '3',
    areaId: '4',
    areaName: 'Quận 7',
    status: 'ASSIGNED',
    priority: 'High',
    scheduledDate: '2024-03-15',
    createdAt: '2024-03-12T14:00:00Z',
    updatedAt: '2024-03-12T14:00:00Z',
  },
  {
    taskId: '3',
    enterpriseUserId: '3',
    enterpriseName: 'Công Ty Tái Chế Xanh',
    createdByUserId: '3',
    areaId: '1',
    areaName: 'Quận 1',
    status: 'PENDING_ENTERPRISE_APPROVAL',
    priority: 'Normal',
    scheduledDate: '2024-03-16',
    createdAt: '2024-03-14T09:00:00Z',
    updatedAt: '2024-03-14T09:00:00Z',
  },
];

export const taskAssignments: TaskAssignment[] = [
  {
    assignmentId: '1',
    taskId: '1',
    collectorUserId: '2',
    collectorName: 'Trần Văn B',
    collectorAvatar: 'https://i.pravatar.cc/150?u=2',
    status: 'ON_THE_WAY',
    assignedAt: '2024-03-13T16:30:00Z',
    acceptedAt: '2024-03-13T16:35:00Z',
  },
  {
    assignmentId: '2',
    taskId: '2',
    collectorUserId: '2',
    collectorName: 'Trần Văn B',
    collectorAvatar: 'https://i.pravatar.cc/150?u=2',
    status: 'ASSIGNED',
    assignedAt: '2024-03-12T15:00:00Z',
  },
];

export const collectorKpis: CollectorKpiDaily[] = [
  {
    kpiId: '1',
    collectorUserId: '2',
    collectorName: 'Trần Văn B',
    areaId: '1',
    areaName: 'Quận 1',
    kpiDate: '2024-03-14',
    minVisits: 5,
    actualVisits: 4,
    minWeightKg: 50,
    actualWeightKg: 42,
    status: 'PENDING',
    updatedAt: '2024-03-14T18:00:00Z',
  },
  {
    kpiId: '2',
    collectorUserId: '2',
    collectorName: 'Trần Văn B',
    areaId: '2',
    areaName: 'Quận 2',
    kpiDate: '2024-03-13',
    minVisits: 5,
    actualVisits: 6,
    minWeightKg: 50,
    actualWeightKg: 68,
    status: 'MET',
    updatedAt: '2024-03-13T18:00:00Z',
  },
];

export const enterpriseCapabilities: EnterpriseCapability[] = [
  {
    capabilityId: '1',
    enterpriseUserId: '3',
    wasteTypeId: '2',
    wasteTypeName: 'Nhựa',
    serviceAreaId: '1',
    serviceAreaName: 'Quận 1',
    dailyCapacityKg: 500,
    usedCapacityKg: 120,
    effectiveFrom: '2024-01-01',
  },
  {
    capabilityId: '2',
    enterpriseUserId: '3',
    wasteTypeId: '3',
    wasteTypeName: 'Giấy',
    serviceAreaId: '1',
    serviceAreaName: 'Quận 1',
    dailyCapacityKg: 300,
    usedCapacityKg: 80,
    effectiveFrom: '2024-01-01',
  },
  {
    capabilityId: '3',
    enterpriseUserId: '3',
    wasteTypeId: '6',
    wasteTypeName: 'Rác điện tử',
    serviceAreaId: '3',
    serviceAreaName: 'Quận 3',
    dailyCapacityKg: 100,
    usedCapacityKg: 45,
    effectiveFrom: '2024-01-01',
  },
];

export const complaints: Complaint[] = [
  {
    complaintId: '1',
    createdByUserId: '1',
    createdByName: 'Nguyễn Văn A',
    createdByAvatar: 'https://i.pravatar.cc/150?u=1',
    reportId: '3',
    category: 'COLLECTION_ISSUE',
    priority: 'Normal',
    status: 'Resolved',
    title: 'Thu gom chậm hơn cam kết',
    content: 'Tôi báo cáo 3 ngày trước nhưng chưa ai đến thu gom',
    adminResponse: 'Đã xác minh và xử lý. Collector sẽ đến trong 24h.',
    createdAt: '2024-03-12T10:00:00Z',
    resolvedAt: '2024-03-13T14:00:00Z',
  },
  {
    complaintId: '2',
    createdByUserId: '5',
    createdByName: 'Lê Thị C',
    createdByAvatar: 'https://i.pravatar.cc/150?u=5',
    category: 'POINTS_ERROR',
    priority: 'High',
    status: 'In_Progress',
    title: 'Không nhận được điểm',
    content: 'Tôi đã báo cáo 5 lần nhưng chỉ nhận được điểm cho 3 lần',
    createdAt: '2024-03-14T08:00:00Z',
  },
];

export const rewardRules: CitizenRewardRule[] = [
  { ruleId: '1', wasteTypeId: '1', wasteTypeName: 'Rác hữu cơ', pointsPerKg: 100, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '2', wasteTypeId: '2', wasteTypeName: 'Nhựa', pointsPerKg: 500, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '3', wasteTypeId: '3', wasteTypeName: 'Giấy', pointsPerKg: 300, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '4', wasteTypeId: '4', wasteTypeName: 'Kim loại', pointsPerKg: 800, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '5', wasteTypeId: '5', wasteTypeName: 'Thủy tinh', pointsPerKg: 400, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '6', wasteTypeId: '6', wasteTypeName: 'Rác điện tử', pointsPerKg: 2000, sortingLevel: 'GOOD', isActive: true },
  { ruleId: '7', wasteTypeId: '7', wasteTypeName: 'Rác nguy hại', pointsPerKg: 3000, sortingLevel: 'GOOD', isActive: true },
];

export const rewardItems: RewardItem[] = [
  { itemId: '1', name: 'Voucher 50.000đ', description: 'Voucher mua hàng tại siêu thị xanh', pointsCost: 5000, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', isActive: true },
  { itemId: '2', name: 'Túi tái chế', description: 'Túi vải thân thiện môi trường', pointsCost: 2000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400', isActive: true },
  { itemId: '3', name: 'Bình giữ nhiệt', description: 'Bình inox 500ml', pointsCost: 8000, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400', isActive: true },
  { itemId: '4', name: 'Voucher 100.000đ', description: 'Voucher mua hàng giá trị cao', pointsCost: 9000, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400', isActive: true },
];

export const rewardTransactions: RewardTransaction[] = [
  { transactionId: '1', citizenUserId: '1', citizenName: 'Nguyễn Văn A', pointsDelta: 500, reasonCode: 'REPORT_APPROVED', visitId: '1', createdAt: '2024-03-13T18:00:00Z' },
  { transactionId: '2', citizenUserId: '1', citizenName: 'Nguyễn Văn A', pointsDelta: 1500, reasonCode: 'REPORT_APPROVED', visitId: '2', createdAt: '2024-03-10T18:00:00Z' },
  { transactionId: '3', citizenUserId: '5', citizenName: 'Lê Thị C', pointsDelta: 2000, reasonCode: 'REPORT_APPROVED', visitId: '3', createdAt: '2024-03-10T18:00:00Z' },
];

export const notifications: Notification[] = [
  {
    id: '1',
    title: 'Chương trình khuyến mãi mới',
    content: 'Tặng 2x điểm cho mọi báo cáo rác điện tử trong tuần này!',
    type: 'Promotion',
    priority: 'Normal',
    targetAudience: 'Citizen',
    isActive: true,
    startDate: '2024-03-14',
    endDate: '2024-03-21',
    createdBy: '4',
    createdAt: '2024-03-14T00:00:00Z',
  },
  {
    id: '2',
    title: 'Bảo trì hệ thống',
    content: 'Hệ thống sẽ bảo trì từ 2h-4h sáng mai',
    type: 'Maintenance',
    priority: 'High',
    targetAudience: 'All',
    isActive: true,
    startDate: '2024-03-15',
    endDate: '2024-03-15',
    createdBy: '4',
    createdAt: '2024-03-14T10:00:00Z',
  },
];

export const leaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: '5', displayName: 'Lê Thị C', avatarUrl: 'https://i.pravatar.cc/150?u=5', points: 12500, reportsCount: 45, areaName: 'Quận 3' },
  { rank: 2, userId: '7', displayName: 'Hoàng Văn E', avatarUrl: 'https://i.pravatar.cc/150?u=7', points: 11200, reportsCount: 38, areaName: 'Quận 1' },
  { rank: 3, userId: '1', displayName: 'Nguyễn Văn A', avatarUrl: 'https://i.pravatar.cc/150?u=1', points: 9800, reportsCount: 32, areaName: 'Quận 2' },
  { rank: 4, userId: '8', displayName: 'Trần Thị F', avatarUrl: 'https://i.pravatar.cc/150?u=8', points: 8500, reportsCount: 28, areaName: 'Quận 7' },
  { rank: 5, userId: '9', displayName: 'Phạm Văn G', avatarUrl: 'https://i.pravatar.cc/150?u=9', points: 7200, reportsCount: 25, areaName: 'Bình Thạnh' },
];

// Dashboard Statistics
export const dashboardStats = {
  totalReports: 1250,
  pendingReports: 45,
  acceptedReports: 120,
  assignedReports: 85,
  collectedReports: 980,
  totalCitizens: 3500,
  totalCollectors: 125,
  totalEnterprises: 15,
  totalComplaints: 23,
  todayCollected: 156,
  todayWeight: 2450,
};

// Monthly stats for charts
export const monthlyStats = [
  { month: 'T1', reports: 180, collected: 165, weight: 2800 },
  { month: 'T2', reports: 220, collected: 205, weight: 3200 },
  { month: 'T3', reports: 250, collected: 235, weight: 3800 },
  { month: 'T4', reports: 200, collected: 185, weight: 2900 },
  { month: 'T5', reports: 280, collected: 265, weight: 4200 },
  { month: 'T6', reports: 320, collected: 305, weight: 4800 },
];
