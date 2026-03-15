import { Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { parseReportDescription } from '@/components/utils/reportMetadata';
import type {
  AssignmentStatus,
  CitizenRewardRule,
  Complaint,
  CollectorKpiDaily,
  EnterpriseCapability,
  LeaderboardEntry,
  Notification,
  RewardItem,
  RewardTransaction,
  ServiceArea,
  SystemSetting,
  Task,
  TaskAssignment,
  WasteReport,
  WasteType,
} from '@/types';
import type { RoleCredential, User, UserRole } from '@/store/useAppStore';
import { useAppStore } from '@/store/useAppStore';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: unknown;
  timestamp?: string;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
}

interface ReportDto {
  reportId: string;
  reporterUserId: string;
  reporterName?: string;
  wasteTypeId?: string;
  wasteTypeName?: string;
  areaId?: string;
  areaName?: string;
  latitude?: number;
  longitude?: number;
  gpsAccuracyMeters?: number;
  description?: string;
  reportPhotoUrl?: string;
  status?: string;
  requestedPickupTime?: string;
  createdAt: string;
}

interface TaskDto {
  taskId: string;
  reportId?: string;
  report?: ReportDto | null;
  enterpriseUserId: string;
  enterpriseName?: string;
  createdByUserId: string;
  collectorUserId?: string;
  collectorName?: string;
  assignmentStatus?: string;
  areaId?: string;
  areaName?: string;
  status: string;
  priority?: string;
  scheduledDate?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

interface KpiDto {
  kpiId?: string;
  collectorUserId: string;
  collectorName?: string;
  areaId?: string;
  areaName?: string;
  kpiDate: string;
  minVisits?: number;
  actualVisits?: number;
  minWeightKg?: number;
  actualWeightKg?: number;
  status?: string;
}

interface UserDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  accountStatus?: User['accountStatus'];
}

interface DashboardStatsDto {
  totalUsers: number;
  totalCitizens: number;
  totalCollectors: number;
  totalEnterprises: number;
  totalReports: number;
  pendingReports: number;
  activeTasks: number;
  completedTasksToday: number;
  openComplaints: number;
  totalRewardPointsIssued: number;
}

interface EnterpriseCapabilityDto {
  capabilityId: string;
  enterpriseUserId: string;
  serviceAreaId: string;
  serviceAreaName?: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  dailyCapacityKg?: number;
  usedCapacityKg?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
}

interface RewardRuleDto {
  ruleId: string;
  wasteTypeId: string;
  wasteTypeName?: string;
  sortingLevel?: string;
  pointsFixed?: number;
  pointsPerKg?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

interface ComplaintDto {
  complaintId: string;
  createdByUserId: string;
  createdByName?: string;
  reportId?: string;
  visitId?: string;
  title?: string;
  content: string;
  category: string;
  priority?: string;
  status?: string;
  adminResponse?: string;
  createdAt?: string;
  resolvedAt?: string;
}

interface RewardTransactionDto {
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

interface RewardItemDto {
  itemId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  pointsCost: number;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NotificationDto {
  id: string;
  title: string;
  content: string;
  type?: string;
  targetAudience?: string;
  priority?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
}

interface SystemSettingDto {
  settingKey: string;
  settingValue: string;
  dataType?: string;
  description?: string;
}

interface WasteTypeEntity {
  wasteTypeId: string;
  name: string;
  description?: string;
  isRecyclable: boolean;
  isActive: boolean;
}

interface ServiceAreaEntity {
  areaId: string;
  name: string;
  geoBoundaryWkt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface RequestOptions {
  method?: HttpMethod;
  token?: string | null;
  headers?: Record<string, string>;
  body?: unknown;
  formData?: FormData;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  displayName?: string;
  role: Exclude<UserRole, 'ADMIN'>;
  enterpriseUserId?: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalCitizens: number;
  totalCollectors: number;
  totalEnterprises: number;
  totalReports: number;
  pendingReports: number;
  activeTasks: number;
  completedTasksToday: number;
  openComplaints: number;
  totalRewardPointsIssued: number;
}

const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? 'Test1234!';
const ADMIN_SETUP_SECRET = process.env.EXPO_PUBLIC_ADMIN_SETUP_SECRET ?? 'swd392-setup-secret';
const DEMO_PREFIX = process.env.EXPO_PUBLIC_DEMO_ACCOUNT_PREFIX ?? 'mobile';

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

export const API_BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

const DEFAULT_REQUEST_TIMEOUT_MS = 12000;
const rawRequestTimeout = Number.parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? '', 10);
const REQUEST_TIMEOUT_MS =
  Number.isFinite(rawRequestTimeout) && rawRequestTimeout > 0
    ? rawRequestTimeout
    : DEFAULT_REQUEST_TIMEOUT_MS;

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function normalizeBaseUrl(rawUrl: string) {
  return rawUrl.trim().replace(/\/+$/, '');
}

function extractMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    typeof (payload as { message?: unknown }).message === 'string'
  ) {
    return (payload as { message: string }).message;
  }

  return fallback;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', token, headers = {}, body, formData } = options;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: requestBody,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(
        `Request timeout after ${REQUEST_TIMEOUT_MS}ms on ${method} ${path}`,
        408,
        error
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new ApiError(`Network error on ${method} ${path}: ${message}`, 0, error);
  } finally {
    clearTimeout(timeoutId);
  }

  const rawText = await response.text();
  let payload: unknown = null;

  if (rawText) {
    try {
      payload = JSON.parse(rawText);
    } catch {
      payload = rawText;
    }
  }

  if (!response.ok) {
    const message = extractMessage(
      payload,
      `Request failed (${response.status}) on ${method} ${path}`
    );
    throw new ApiError(message, response.status, payload);
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    typeof (payload as { success?: unknown }).success === 'boolean'
  ) {
    const envelope = payload as ApiEnvelope<T>;
    if (!envelope.success) {
      throw new ApiError(
        envelope.message ?? `API returned success=false on ${method} ${path}`,
        response.status,
        envelope.errors
      );
    }

    return envelope.data;
  }

  return payload as T;
}

function normalizeRole(role: string): UserRole {
  const value = role.toUpperCase();
  if (value === 'CITIZEN' || value === 'COLLECTOR' || value === 'ENTERPRISE' || value === 'ADMIN') {
    return value;
  }
  return 'CITIZEN';
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function colorAndIconForWaste(name: string | undefined, wasteTypeId: string) {
  const lowerName = (name ?? '').toLowerCase();

  if (lowerName.includes('hữu cơ') || lowerName.includes('organic')) {
    return { color: Colors.waste.organic, icon: 'Leaf' };
  }
  if (lowerName.includes('nhựa') || lowerName.includes('plastic')) {
    return { color: Colors.waste.plastic, icon: 'Box' };
  }
  if (lowerName.includes('giấy') || lowerName.includes('paper')) {
    return { color: Colors.waste.paper, icon: 'FileText' };
  }
  if (lowerName.includes('kim loại') || lowerName.includes('metal')) {
    return { color: Colors.waste.metal, icon: 'CircleDot' };
  }
  if (lowerName.includes('thủy tinh') || lowerName.includes('glass')) {
    return { color: Colors.waste.glass, icon: 'Wine' };
  }
  if (lowerName.includes('điện') || lowerName.includes('electronic')) {
    return { color: Colors.waste.electronic, icon: 'Smartphone' };
  }
  if (lowerName.includes('nguy hại') || lowerName.includes('hazard')) {
    return { color: Colors.waste.hazardous, icon: 'AlertTriangle' };
  }

  const fallbackPalette = [
    Colors.waste.recyclable,
    Colors.primary[500],
    Colors.secondary[500],
    Colors.accent[500],
  ];
  const fallbackIcons = ['Box', 'FileText', 'CircleDot', 'Leaf'];

  const color = fallbackPalette[hashString(wasteTypeId) % fallbackPalette.length];
  const icon = fallbackIcons[hashString(wasteTypeId) % fallbackIcons.length];

  return { color, icon };
}

function normalizeReportStatus(status?: string): WasteReport['status'] {
  switch ((status ?? '').toUpperCase()) {
    case 'PENDING':
      return 'PENDING';
    case 'ACCEPTED':
      return 'ACCEPTED';
    case 'ASSIGNED':
      return 'ASSIGNED';
    case 'ON_THE_WAY':
      return 'ON_THE_WAY';
    case 'COLLECTED':
    case 'COMPLETED':
      return 'COLLECTED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'PENDING';
  }
}

function normalizeAssignmentStatus(status?: string): AssignmentStatus {
  switch ((status ?? '').toUpperCase()) {
    case 'ASSIGNED':
      return 'ASSIGNED';
    case 'ACCEPTED':
      return 'ACCEPTED';
    case 'ON_THE_WAY':
      return 'ON_THE_WAY';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'COLLECTED':
      return 'COLLECTED';
    case 'COMPLETED':
      return 'COMPLETED';
    case 'FAILED':
      return 'FAILED';
    case 'CANCELLED':
      return 'CANCELLED';
    case 'REJECTED':
      return 'REJECTED';
    case 'UNASSIGNED':
      return 'UNASSIGNED';
    default:
      return 'ASSIGNED';
  }
}

function toUserFromAuth(auth: AuthResponseDto): User {
  return {
    userId: auth.userId,
    email: auth.email,
    firstName: auth.firstName,
    lastName: auth.lastName,
    displayName: auth.displayName,
    role: normalizeRole(auth.role),
    avatarUrl: auth.avatarUrl,
    accountStatus: 'ACTIVE',
  };
}

function toUserFromDto(dto: UserDto): User {
  return {
    userId: dto.userId,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    displayName: dto.displayName,
    phone: dto.phone,
    avatarUrl: dto.avatarUrl,
    role: normalizeRole(dto.role),
    accountStatus: dto.accountStatus ?? 'ACTIVE',
  };
}

function toWasteType(entity: WasteTypeEntity): WasteType {
  const { color, icon } = colorAndIconForWaste(entity.name, entity.wasteTypeId);

  return {
    wasteTypeId: entity.wasteTypeId,
    name: entity.name,
    description: entity.description,
    isRecyclable: !!entity.isRecyclable,
    isActive: !!entity.isActive,
    color,
    icon,
  };
}

function toServiceArea(entity: ServiceAreaEntity): ServiceArea {
  return {
    areaId: entity.areaId,
    name: entity.name,
    geoBoundaryWkt: entity.geoBoundaryWkt,
    isActive: entity.isActive ?? true,
    createdAt: entity.createdAt ?? new Date().toISOString(),
    updatedAt: entity.updatedAt ?? new Date().toISOString(),
  };
}

function toWasteReport(dto: ReportDto): WasteReport {
  const { color } = colorAndIconForWaste(dto.wasteTypeName, dto.wasteTypeId ?? dto.reportId);
  const parsedDescription = parseReportDescription(dto.description);

  return {
    reportId: dto.reportId,
    reporterUserId: dto.reporterUserId,
    reporterName: dto.reporterName,
    wasteTypeId: dto.wasteTypeId ?? '',
    wasteTypeName: dto.wasteTypeName ?? 'Rác thải',
    wasteTypeColor: color,
    areaId: dto.areaId,
    areaName: dto.areaName ?? 'Khu vực chưa xác định',
    latitude: dto.latitude,
    longitude: dto.longitude,
    gpsAccuracyMeters: dto.gpsAccuracyMeters,
    description: parsedDescription.cleanDescription || undefined,
    estimatedWeightKg: parsedDescription.estimatedWeightKg,
    reportPhotoUrl: dto.reportPhotoUrl,
    status: normalizeReportStatus(dto.status),
    requestedPickupTime: dto.requestedPickupTime,
    createdAt: dto.createdAt,
  };
}

function toTaskAssignment(dto: TaskDto): TaskAssignment {
  const assignmentStatus = normalizeAssignmentStatus(dto.assignmentStatus ?? dto.status);
  const report = dto.report ? toWasteReport(dto.report) : undefined;

  const task: Task = {
    taskId: dto.taskId,
    reportId: dto.reportId,
    enterpriseUserId: dto.enterpriseUserId,
    enterpriseName: dto.enterpriseName,
    createdByUserId: dto.createdByUserId,
    collectorUserId: dto.collectorUserId,
    collectorName: dto.collectorName,
    assignmentStatus: dto.assignmentStatus,
    areaId: dto.areaId ?? report?.areaId,
    areaName: dto.areaName ?? report?.areaName,
    status: (dto.status ?? 'ASSIGNED') as Task['status'],
    priority: dto.priority,
    scheduledDate: dto.scheduledDate,
    rejectionReason: dto.rejectionReason,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    report,
  };

  return {
    assignmentId: dto.taskId,
    taskId: dto.taskId,
    collectorUserId: dto.collectorUserId ?? '',
    collectorName: dto.collectorName,
    status: assignmentStatus,
    assignedAt: dto.updatedAt ?? dto.createdAt,
    task,
  };
}

function toTask(dto: TaskDto): Task {
  const report = dto.report ? toWasteReport(dto.report) : undefined;

  return {
    taskId: dto.taskId,
    reportId: dto.reportId,
    enterpriseUserId: dto.enterpriseUserId,
    enterpriseName: dto.enterpriseName,
    createdByUserId: dto.createdByUserId,
    collectorUserId: dto.collectorUserId,
    collectorName: dto.collectorName,
    assignmentStatus: dto.assignmentStatus,
    areaId: dto.areaId ?? report?.areaId,
    areaName: dto.areaName ?? report?.areaName,
    status: (dto.status ?? 'PENDING') as Task['status'],
    priority: dto.priority,
    scheduledDate: dto.scheduledDate,
    rejectionReason: dto.rejectionReason,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    report,
  };
}

function toLeaderboardEntry(dto: {
  rank: number;
  citizenUserId: string;
  displayName: string;
  avatarUrl?: string;
  points: number;
}): LeaderboardEntry {
  return {
    rank: dto.rank,
    userId: dto.citizenUserId,
    displayName: dto.displayName,
    avatarUrl: dto.avatarUrl,
    points: dto.points,
    reportsCount: 0,
    areaName: 'Toàn hệ thống',
  };
}

function toCollectorKpi(dto: KpiDto): CollectorKpiDaily {
  return {
    kpiId: dto.kpiId ?? `${dto.collectorUserId}-${dto.kpiDate}`,
    collectorUserId: dto.collectorUserId,
    collectorName: dto.collectorName,
    areaId: dto.areaId ?? '',
    areaName: dto.areaName ?? 'Chưa cấu hình',
    kpiDate: dto.kpiDate,
    minVisits: dto.minVisits ?? 0,
    actualVisits: dto.actualVisits ?? 0,
    minWeightKg: dto.minWeightKg ?? 0,
    actualWeightKg: dto.actualWeightKg ?? 0,
    status: (dto.status ?? 'PENDING') as CollectorKpiDaily['status'],
  };
}

function toEnterpriseCapability(dto: EnterpriseCapabilityDto): EnterpriseCapability {
  return {
    capabilityId: dto.capabilityId,
    enterpriseUserId: dto.enterpriseUserId,
    wasteTypeId: dto.wasteTypeId,
    wasteTypeName: dto.wasteTypeName,
    serviceAreaId: dto.serviceAreaId,
    serviceAreaName: dto.serviceAreaName,
    dailyCapacityKg: dto.dailyCapacityKg ?? 0,
    usedCapacityKg: dto.usedCapacityKg ?? 0,
    effectiveFrom: dto.effectiveFrom,
    effectiveTo: dto.effectiveTo,
  };
}

function toRewardRule(dto: RewardRuleDto): CitizenRewardRule {
  return {
    ruleId: dto.ruleId,
    wasteTypeId: dto.wasteTypeId,
    wasteTypeName: dto.wasteTypeName,
    pointsPerKg: dto.pointsPerKg ?? 0,
    pointsFixed: dto.pointsFixed,
    sortingLevel: dto.sortingLevel ?? 'GOOD',
    isActive: dto.isActive ?? true,
    effectiveFrom: dto.effectiveFrom,
    effectiveTo: dto.effectiveTo,
  };
}

function toComplaint(dto: ComplaintDto): Complaint {
  return {
    complaintId: dto.complaintId,
    createdByUserId: dto.createdByUserId,
    createdByName: dto.createdByName,
    reportId: dto.reportId,
    visitId: dto.visitId,
    category: (dto.category as Complaint['category']) ?? 'OTHER',
    priority: (dto.priority as Complaint['priority']) ?? 'Normal',
    status: (dto.status as Complaint['status']) ?? 'Pending',
    title: dto.title,
    content: dto.content,
    adminResponse: dto.adminResponse,
    createdAt: dto.createdAt ?? new Date().toISOString(),
    resolvedAt: dto.resolvedAt,
  };
}

function toRewardTransaction(dto: RewardTransactionDto): RewardTransaction {
  return {
    transactionId: dto.transactionId,
    citizenUserId: dto.citizenUserId,
    citizenName: dto.citizenName,
    pointsDelta: dto.pointsDelta,
    reasonCode: dto.reasonCode,
    visitId: dto.visitId,
    complaintId: dto.complaintId,
    createdByAdminId: dto.createdByAdminId,
    createdAt: dto.createdAt,
  };
}

function toRewardItem(dto: RewardItemDto): RewardItem {
  return {
    itemId: dto.itemId,
    name: dto.name,
    description: dto.description,
    pointsCost: dto.pointsCost ?? 0,
    stock: dto.stock ?? 0,
    imageUrl: dto.imageUrl,
    isActive: dto.isActive ?? true,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function toNotification(dto: NotificationDto): Notification {
  return {
    id: dto.id,
    title: dto.title,
    content: dto.content,
    type: (dto.type as Notification['type']) ?? 'General',
    priority: (dto.priority as Notification['priority']) ?? 'Normal',
    targetAudience: (dto.targetAudience as Notification['targetAudience']) ?? 'All',
    isActive: dto.isActive ?? true,
    startDate: dto.startDate,
    endDate: dto.endDate,
    createdBy: '',
    createdAt: dto.createdAt,
  };
}

function toSystemSetting(dto: SystemSettingDto): SystemSetting {
  return {
    settingKey: dto.settingKey,
    settingValue: dto.settingValue,
    dataType: dto.dataType,
    description: dto.description,
  };
}

function createInstallationId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getRoleDefaultCredential(role: UserRole, installationId: string): RoleCredential {
  const email = `${DEMO_PREFIX}.${role.toLowerCase()}.${installationId}@swd392.local`;
  return {
    email,
    password: DEMO_PASSWORD,
  };
}

function getRoleProfile(role: UserRole) {
  switch (role) {
    case 'CITIZEN':
      return { firstName: 'Citizen', lastName: 'Demo', displayName: 'Citizen Demo' };
    case 'COLLECTOR':
      return { firstName: 'Collector', lastName: 'Demo', displayName: 'Collector Demo' };
    case 'ENTERPRISE':
      return { firstName: 'Enterprise', lastName: 'Demo', displayName: 'Enterprise Demo' };
    case 'ADMIN':
      return { firstName: 'Admin', lastName: 'Demo', displayName: 'Admin Demo' };
  }
}

async function login(email: string, password: string) {
  return request<AuthResponseDto>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

async function register(
  role: Exclude<UserRole, 'ADMIN'>,
  credential: RoleCredential,
  extra?: { enterpriseUserId?: string }
) {
  const profile = getRoleProfile(role);

  return request<AuthResponseDto>('/auth/register', {
    method: 'POST',
    body: {
      email: credential.email,
      password: credential.password,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      role,
      enterpriseUserId: extra?.enterpriseUserId,
    },
  });
}

async function adminSetup(credential: RoleCredential) {
  const profile = getRoleProfile('ADMIN');

  return request<AuthResponseDto>('/auth/admin-setup', {
    method: 'POST',
    headers: {
      'X-Setup-Secret': ADMIN_SETUP_SECRET,
    },
    body: {
      email: credential.email,
      password: credential.password,
      firstName: profile.firstName,
      lastName: profile.lastName,
      displayName: profile.displayName,
      role: 'CITIZEN',
    },
  });
}

async function resolveNonAdminAuth(
  role: Exclude<UserRole, 'ADMIN'>,
  credential: RoleCredential,
  extra?: { enterpriseUserId?: string }
): Promise<{ auth: AuthResponseDto; credential: RoleCredential }> {
  try {
    return { auth: await login(credential.email, credential.password), credential };
  } catch {
    try {
      return { auth: await register(role, credential, extra), credential };
    } catch (error) {
      if (error instanceof ApiError && error.message.toLowerCase().includes('already registered')) {
        return { auth: await login(credential.email, credential.password), credential };
      }

      const fallbackCredential: RoleCredential = {
        ...credential,
        email: credential.email.replace('@', `.${Date.now().toString(36)}@`),
      };

      return {
        auth: await register(role, fallbackCredential, extra),
        credential: fallbackCredential,
      };
    }
  }
}

async function resolveAdminAuth(
  credential: RoleCredential
): Promise<{ auth: AuthResponseDto; credential: RoleCredential }> {
  try {
    return { auth: await login(credential.email, credential.password), credential };
  } catch {
    return { auth: await adminSetup(credential), credential };
  }
}

async function ensureInstallationId() {
  const store = useAppStore.getState();
  if (store.installationId) {
    return store.installationId;
  }

  const newInstallationId = createInstallationId();
  store.setInstallationId(newInstallationId);
  return newInstallationId;
}

async function resolveRoleSessionInternal(
  role: UserRole,
  resolved: Partial<Record<UserRole, { auth: AuthResponseDto; credential: RoleCredential }>> = {}
): Promise<{ auth: AuthResponseDto; credential: RoleCredential }> {
  if (resolved[role]) {
    return resolved[role] as { auth: AuthResponseDto; credential: RoleCredential };
  }

  const installationId = await ensureInstallationId();
  const store = useAppStore.getState();

  const baseCredential = store.roleCredentials[role] ?? getRoleDefaultCredential(role, installationId);

  let result: { auth: AuthResponseDto; credential: RoleCredential };

  if (role === 'COLLECTOR') {
    const enterprise = await resolveRoleSessionInternal('ENTERPRISE', resolved);
    result = await resolveNonAdminAuth('COLLECTOR', baseCredential, {
      enterpriseUserId: enterprise.auth.userId,
    });
  } else if (role === 'ADMIN') {
    result = await resolveAdminAuth(baseCredential);
  } else {
    result = await resolveNonAdminAuth(role, baseCredential);
  }

  resolved[role] = result;
  return result;
}

export async function syncRoleSession(role: UserRole) {
  const resolved: Partial<Record<UserRole, { auth: AuthResponseDto; credential: RoleCredential }>> = {};
  const active = await resolveRoleSessionInternal(role, resolved);

  const store = useAppStore.getState();

  for (const [resolvedRole, value] of Object.entries(resolved)) {
    const typedRole = resolvedRole as UserRole;
    store.upsertRoleCredential(typedRole, {
      email: value.credential.email,
      password: value.credential.password,
      userId: value.auth.userId,
    });
  }

  const user = toUserFromAuth(active.auth);
  store.setAuthenticatedSession({
    user,
    accessToken: active.auth.accessToken,
    refreshToken: active.auth.refreshToken,
    role,
  });

  return user;
}

export async function loginWithPassword(payload: LoginPayload) {
  const email = payload.email.trim().toLowerCase();
  const auth = await login(email, payload.password);
  const role = normalizeRole(auth.role);
  const user = toUserFromAuth(auth);

  const store = useAppStore.getState();
  store.upsertRoleCredential(role, {
    email,
    password: payload.password,
    userId: auth.userId,
  });
  store.setAuthenticatedSession({
    user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    role,
  });

  return user;
}

export async function registerWithPassword(payload: RegisterPayload) {
  const email = payload.email.trim().toLowerCase();
  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const displayName =
    payload.displayName?.trim() || `${firstName} ${lastName}`.trim();
  const normalizedEnterpriseUserId = payload.enterpriseUserId?.trim();

  if (payload.role === 'COLLECTOR' && !normalizedEnterpriseUserId) {
    throw new ApiError('Enterprise user ID is required for COLLECTOR role', 400);
  }

  const auth = await request<AuthResponseDto>('/auth/register', {
    method: 'POST',
    body: {
      email,
      password: payload.password,
      firstName,
      lastName,
      phone: payload.phone?.trim() || undefined,
      displayName,
      role: payload.role,
      enterpriseUserId:
        payload.role === 'COLLECTOR' ? normalizedEnterpriseUserId : undefined,
    },
  });

  const role = normalizeRole(auth.role);
  const user = toUserFromAuth(auth);

  const store = useAppStore.getState();
  store.upsertRoleCredential(role, {
    email,
    password: payload.password,
    userId: auth.userId,
  });
  store.setAuthenticatedSession({
    user,
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
    role,
  });

  return user;
}

export async function logoutSession(token: string | null) {
  if (!token) {
    return;
  }

  try {
    await request<void>('/auth/logout', {
      method: 'POST',
      token,
    });
  } catch {
    // Ignore remote logout errors in local dev.
  }
}

export async function fetchWasteTypes() {
  const data = await request<WasteTypeEntity[]>('/waste-types');
  return data.map(toWasteType);
}

export async function fetchServiceAreas() {
  const data = await request<ServiceAreaEntity[]>('/service-areas');
  return data.map(toServiceArea);
}

export async function fetchMyReports(token: string, size = 50) {
  const page = await request<PageResponse<ReportDto>>(`/reports/mine?page=0&size=${size}`, {
    token,
  });

  return page.content.map(toWasteReport);
}

export async function fetchReportById(token: string, reportId: string) {
  const dto = await request<ReportDto>(`/reports/${reportId}`, {
    token,
  });

  return toWasteReport(dto);
}

export async function createWasteReport(
  token: string,
  payload: {
    latitude: number;
    longitude: number;
    description?: string;
    wasteTypeId?: string;
    areaId?: string;
    reportPhotoUrl?: string;
  }
) {
  const dto = await request<ReportDto>('/reports', {
    method: 'POST',
    token,
    body: payload,
  });

  return toWasteReport(dto);
}

export async function uploadReportPhoto(token: string, localUri: string) {
  const filename = localUri.split('/').pop() ?? `report-${Date.now()}.jpg`;
  const formData = new FormData();

  formData.append(
    'file',
    {
      uri: localUri,
      name: filename,
      type: 'image/jpeg',
    } as unknown as Blob
  );

  return request<string>('/reports/upload-photo', {
    method: 'POST',
    token,
    formData,
  });
}

export async function fetchRewardBalance(token: string) {
  return request<number>('/rewards/balance', { token });
}

export async function fetchRewardItems(token?: string | null) {
  const authToken = token ?? useAppStore.getState().accessToken;
  const data = await request<RewardItemDto[]>('/rewards/items', { token: authToken });
  return data.map(toRewardItem);
}

export async function fetchLeaderboard(limit = 20, token?: string | null) {
  const authToken = token ?? useAppStore.getState().accessToken;
  const data = await request<
    {
      rank: number;
      citizenUserId: string;
      displayName: string;
      avatarUrl?: string;
      points: number;
    }[]
  >(`/rewards/leaderboard?limit=${limit}`, { token: authToken });

  return data.map(toLeaderboardEntry);
}

export async function redeemRewardItem(itemId: string, token?: string | null) {
  const authToken = token ?? useAppStore.getState().accessToken;
  const dto = await request<RewardTransactionDto>('/rewards/redeem', {
    method: 'POST',
    token: authToken,
    body: { itemId },
  });

  return toRewardTransaction(dto);
}

export async function fetchMyProfile(token: string) {
  const dto = await request<UserDto>('/users/me', { token });
  return toUserFromDto(dto);
}

export async function fetchCollectorTasks(token: string, size = 50) {
  const page = await request<PageResponse<TaskDto>>(`/collector/tasks?page=0&size=${size}`, {
    token,
  });

  return page.content.map(toTaskAssignment);
}

export async function fetchCollectorTaskById(token: string, taskId: string) {
  const dto = await request<TaskDto>(`/collector/tasks/${taskId}`, {
    token,
  });

  return toTaskAssignment(dto);
}

export async function updateCollectorTaskStatus(
  token: string,
  taskId: string,
  status: 'ACCEPTED' | 'ON_THE_WAY'
) {
  const dto = await request<TaskDto>(
    `/collector/tasks/${taskId}/status?status=${encodeURIComponent(status)}`,
    {
      method: 'PUT',
      token,
    }
  );

  return toTaskAssignment(dto);
}

export async function uploadCollectorEvidence(token: string, localUri: string) {
  const filename = localUri.split('/').pop() ?? `evidence-${Date.now()}.jpg`;
  const formData = new FormData();

  formData.append(
    'file',
    {
      uri: localUri,
      name: filename,
      type: 'image/jpeg',
    } as unknown as Blob
  );

  return request<string>('/collector/evidence/upload', {
    method: 'POST',
    token,
    formData,
  });
}

export async function completeCollectorTask(
  token: string,
  taskId: string,
  payloadOrNote?:
    | string
    | {
        visitStatus?: string;
        note?: string;
        photoUrls?: string[];
        wasteItems?: {
          wasteTypeId?: string;
          weightKg?: number;
          sortingLevel?: string;
          contaminationNote?: string;
        }[];
      }
) {
  const payload =
    typeof payloadOrNote === 'string'
      ? { note: payloadOrNote }
      : (payloadOrNote ?? {});

  const dto = await request<TaskDto>(`/collector/tasks/${taskId}/complete`, {
    method: 'POST',
    token,
    body: {
      visitStatus: payload.visitStatus ?? 'SUCCESS',
      collectorNote: payload.note ?? 'Completed from mobile app',
      photoUrls: payload.photoUrls ?? [],
      wasteItems: payload.wasteItems ?? [],
    },
  });

  return toTaskAssignment(dto);
}

export async function fetchCollectorKpiToday(token: string) {
  const dto = await request<KpiDto>('/collector/kpi/today', { token });
  return toCollectorKpi(dto);
}

export async function fetchReports(
  token: string,
  options?: { page?: number; size?: number; status?: string }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 50;
  const status = options?.status ? `&status=${encodeURIComponent(options.status)}` : '';
  const response = await request<PageResponse<ReportDto>>(
    `/reports?page=${page}&size=${size}${status}`,
    { token }
  );

  return response.content.map(toWasteReport);
}

export async function fetchMyComplaints(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 50;
  const response = await request<PageResponse<ComplaintDto>>(
    `/complaints/mine?page=${page}&size=${size}`,
    { token }
  );

  return response.content.map(toComplaint);
}

export async function createComplaint(
  token: string,
  payload: {
    content: string;
    title?: string;
    category?: Complaint['category'];
    priority?: Complaint['priority'];
    reportId?: string;
    visitId?: string;
    rewardTransactionId?: string;
  }
) {
  const fallbackTitle = payload.category
    ? `Phan hoi ${payload.category.toLowerCase()}`
    : 'Phan hoi tu mobile';
  const dto = await request<ComplaintDto>('/complaints', {
    method: 'POST',
    token,
    body: {
      ...payload,
      title: payload.title?.trim() || fallbackTitle,
      category: payload.category ?? 'OTHER',
      priority: payload.priority ?? 'Normal',
    },
  });

  return toComplaint(dto);
}

export async function fetchRewardTransactions(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 50;
  const response = await request<PageResponse<RewardTransactionDto>>(
    `/rewards/transactions?page=${page}&size=${size}`,
    { token }
  );

  return response.content.map(toRewardTransaction);
}

export async function fetchAdminDashboard(token: string): Promise<AdminDashboardStats> {
  const dto = await request<DashboardStatsDto>('/admin/dashboard', { token });
  return {
    totalUsers: dto.totalUsers ?? 0,
    totalCitizens: dto.totalCitizens ?? 0,
    totalCollectors: dto.totalCollectors ?? 0,
    totalEnterprises: dto.totalEnterprises ?? 0,
    totalReports: dto.totalReports ?? 0,
    pendingReports: dto.pendingReports ?? 0,
    activeTasks: dto.activeTasks ?? 0,
    completedTasksToday: dto.completedTasksToday ?? 0,
    openComplaints: dto.openComplaints ?? 0,
    totalRewardPointsIssued: dto.totalRewardPointsIssued ?? 0,
  };
}

export async function fetchAdminUsers(
  token: string,
  options?: { page?: number; size?: number; role?: UserRole; status?: User['accountStatus'] }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;
  const role = options?.role ? `&role=${encodeURIComponent(options.role)}` : '';
  const status = options?.status ? `&status=${encodeURIComponent(options.status)}` : '';
  const response = await request<PageResponse<UserDto>>(
    `/admin/users?page=${page}&size=${size}${role}${status}`,
    { token }
  );

  return response.content.map(toUserFromDto);
}

export async function updateAdminUserStatus(
  token: string,
  userId: string,
  status: User['accountStatus']
) {
  const dto = await request<UserDto>(
    `/admin/users/${userId}/status?status=${encodeURIComponent(status)}`,
    {
      method: 'PUT',
      token,
    }
  );

  return toUserFromDto(dto);
}

export async function updateAdminUserRole(
  token: string,
  userId: string,
  role: UserRole
) {
  const dto = await request<UserDto>(
    `/admin/users/${userId}/role?role=${encodeURIComponent(role)}`,
    {
      method: 'PUT',
      token,
    }
  );

  return toUserFromDto(dto);
}

export async function deleteAdminUser(token: string, userId: string) {
  await request<void>(`/admin/users/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchAdminComplaints(
  token: string,
  options?: { page?: number; size?: number; status?: string }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;
  const status = options?.status ? `&status=${encodeURIComponent(options.status)}` : '';
  const response = await request<PageResponse<ComplaintDto>>(
    `/complaints?page=${page}&size=${size}${status}`,
    { token }
  );

  return response.content.map(toComplaint);
}

export async function resolveAdminComplaint(
  token: string,
  complaintId: string,
  payload: {
    decision: string;
    note?: string;
    isAccepted?: boolean;
    adminResponse?: string;
  }
) {
  const dto = await request<ComplaintDto>(`/complaints/${complaintId}/resolve`, {
    method: 'PUT',
    token,
    body: payload,
  });

  return toComplaint(dto);
}

export async function fetchUserNotifications(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 20;
  const response = await request<PageResponse<NotificationDto>>(
    `/notifications?page=${page}&size=${size}`,
    { token }
  );
  return response.content.map(toNotification);
}

export async function fetchAdminNotifications(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;
  const response = await request<PageResponse<NotificationDto>>(
    `/admin/notifications?page=${page}&size=${size}`,
    { token }
  );
  return response.content.map(toNotification);
}

export async function createAdminNotification(
  token: string,
  payload: {
    title: string;
    content: string;
    type?: Notification['type'];
    targetAudience?: Notification['targetAudience'];
    priority?: Complaint['priority'];
    startDate?: string;
    endDate?: string;
  }
) {
  const dto = await request<NotificationDto>('/admin/notifications', {
    method: 'POST',
    token,
    body: payload,
  });
  return toNotification(dto);
}

export async function deactivateAdminNotification(token: string, notificationId: string) {
  await request<void>(`/admin/notifications/${notificationId}/deactivate`, {
    method: 'PUT',
    token,
  });
}

export async function fetchAdminRewardItems(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;
  const response = await request<PageResponse<RewardItemDto>>(
    `/admin/reward-items?page=${page}&size=${size}`,
    { token }
  );
  return response.content.map(toRewardItem);
}

export async function createAdminRewardItem(
  token: string,
  payload: {
    name: string;
    description?: string;
    imageUrl?: string;
    pointsCost: number;
    stock: number;
    isActive?: boolean;
  }
) {
  const dto = await request<RewardItemDto>('/admin/reward-items', {
    method: 'POST',
    token,
    body: payload,
  });
  return toRewardItem(dto);
}

export async function updateAdminRewardItem(
  token: string,
  itemId: string,
  payload: {
    name?: string;
    description?: string;
    imageUrl?: string;
    pointsCost?: number;
    stock?: number;
    isActive?: boolean;
  }
) {
  const dto = await request<RewardItemDto>(`/admin/reward-items/${itemId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
  return toRewardItem(dto);
}

export async function deactivateAdminRewardItem(token: string, itemId: string) {
  await request<void>(`/admin/reward-items/${itemId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchAdminSettings(token: string) {
  const response = await request<SystemSettingDto[]>('/admin/settings', { token });
  return response.map(toSystemSetting);
}

export async function createAdminSetting(
  token: string,
  payload: {
    settingKey: string;
    settingValue: string;
    dataType?: string;
    description?: string;
  }
) {
  const dto = await request<SystemSettingDto>('/admin/settings', {
    method: 'POST',
    token,
    body: payload,
  });
  return toSystemSetting(dto);
}

export async function updateAdminSetting(
  token: string,
  key: string,
  payload: { settingValue: string; description?: string }
) {
  const dto = await request<SystemSettingDto>(`/admin/settings/${encodeURIComponent(key)}`, {
    method: 'PUT',
    token,
    body: payload,
  });
  return toSystemSetting(dto);
}

export async function deleteAdminSetting(token: string, key: string) {
  await request<void>(`/admin/settings/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchEnterprisePendingReports(
  token: string,
  options?: { page?: number; size?: number }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 50;
  const response = await request<PageResponse<ReportDto>>(
    `/enterprise/reports/pending?page=${page}&size=${size}`,
    { token }
  );

  return response.content.map(toWasteReport);
}

export async function acceptEnterpriseReport(token: string, reportId: string) {
  const dto = await request<TaskDto>(`/enterprise/reports/${reportId}/accept`, {
    method: 'PUT',
    token,
  });

  return toTask(dto);
}

export async function rejectEnterpriseReport(token: string, reportId: string, reason?: string) {
  const query = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  await request<void>(`/enterprise/reports/${reportId}/reject${query}`, {
    method: 'PUT',
    token,
  });
}

export async function fetchEnterpriseTasks(
  token: string,
  options?: { page?: number; size?: number; status?: Task['status'] }
) {
  const page = options?.page ?? 0;
  const size = options?.size ?? 100;
  const status = options?.status ? `&status=${encodeURIComponent(options.status)}` : '';
  const response = await request<PageResponse<TaskDto>>(
    `/enterprise/tasks?page=${page}&size=${size}${status}`,
    { token }
  );

  return response.content.map(toTask);
}

export async function assignEnterpriseTask(
  token: string,
  taskId: string,
  collectorUserId: string
) {
  const dto = await request<TaskDto>(`/enterprise/tasks/${taskId}/assign`, {
    method: 'POST',
    token,
    body: { collectorUserId },
  });

  return toTask(dto);
}

export async function fetchEnterpriseCollectors(token: string) {
  const data = await request<UserDto[]>('/enterprise/collectors', { token });
  return data.map(toUserFromDto);
}

export async function fetchEnterpriseCollectorKpiHistory(token: string, collectorId: string) {
  const data = await request<KpiDto[]>(`/enterprise/collectors/${collectorId}/kpi`, { token });
  return data.map(toCollectorKpi);
}

export async function updateEnterpriseCollector(
  token: string,
  collectorId: string,
  payload: {
    firstName?: string;
    lastName?: string;
    displayName?: string;
    phone?: string;
    addressText?: string;
  }
) {
  const dto = await request<UserDto>(`/enterprise/collectors/${collectorId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
  return toUserFromDto(dto);
}

export async function deactivateEnterpriseCollector(token: string, collectorId: string) {
  await request<void>(`/enterprise/collectors/${collectorId}`, {
    method: 'DELETE',
    token,
  });
}

export async function setEnterpriseCollectorKpi(
  token: string,
  payload: {
    collectorUserId: string;
    areaId: string;
    minVisits?: number;
    minWeightKg?: number;
    kpiDate?: string;
  }
) {
  const dto = await request<KpiDto>('/enterprise/collectors/kpi', {
    method: 'POST',
    token,
    body: payload,
  });
  return toCollectorKpi(dto);
}

export async function setEnterpriseCollectorsKpi(
  token: string,
  payload: {
    areaId: string;
    minVisits?: number;
    minWeightKg?: number;
    kpiDate?: string;
  }
) {
  const data = await request<KpiDto[]>('/enterprise/collectors/kpi/all', {
    method: 'POST',
    token,
    body: payload,
  });
  return data.map(toCollectorKpi);
}

export async function fetchEnterpriseCapabilities(token: string) {
  const data = await request<EnterpriseCapabilityDto[]>('/enterprise/capabilities', { token });
  return data.map(toEnterpriseCapability);
}

export async function createEnterpriseCapability(
  token: string,
  payload: {
    serviceAreaId: string;
    wasteTypeId: string;
    dailyCapacityKg: number;
    effectiveFrom?: string;
    effectiveTo?: string;
  }
) {
  const dto = await request<EnterpriseCapabilityDto>('/enterprise/capabilities', {
    method: 'POST',
    token,
    body: payload,
  });
  return toEnterpriseCapability(dto);
}

export async function deleteEnterpriseCapability(token: string, capabilityId: string) {
  await request<void>(`/enterprise/capabilities/${capabilityId}`, {
    method: 'DELETE',
    token,
  });
}

export async function fetchEnterpriseRewardRules(token: string) {
  const data = await request<RewardRuleDto[]>('/enterprise/reward-rules', { token });
  return data.map(toRewardRule);
}

export async function createEnterpriseRewardRule(
  token: string,
  payload: {
    wasteTypeId: string;
    sortingLevel: string;
    pointsFixed?: number;
    pointsPerKg?: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive?: boolean;
  }
) {
  const dto = await request<RewardRuleDto>('/enterprise/reward-rules', {
    method: 'POST',
    token,
    body: payload,
  });
  return toRewardRule(dto);
}

export async function updateEnterpriseRewardRule(
  token: string,
  ruleId: string,
  payload: {
    wasteTypeId?: string;
    sortingLevel?: string;
    pointsFixed?: number;
    pointsPerKg?: number;
    effectiveFrom?: string;
    effectiveTo?: string;
    isActive?: boolean;
  }
) {
  const dto = await request<RewardRuleDto>(`/enterprise/reward-rules/${ruleId}`, {
    method: 'PUT',
    token,
    body: payload,
  });
  return toRewardRule(dto);
}

export async function deactivateEnterpriseRewardRule(token: string, ruleId: string) {
  await request<void>(`/enterprise/reward-rules/${ruleId}`, {
    method: 'DELETE',
    token,
  });
}
