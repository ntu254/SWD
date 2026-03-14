import { Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import type {
  AssignmentStatus,
  CollectorKpiDaily,
  LeaderboardEntry,
  ServiceArea,
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

const DEMO_PASSWORD = process.env.EXPO_PUBLIC_DEMO_PASSWORD ?? 'Test1234!';
const ADMIN_SETUP_SECRET = process.env.EXPO_PUBLIC_ADMIN_SETUP_SECRET ?? 'swd392-setup-secret';
const DEMO_PREFIX = process.env.EXPO_PUBLIC_DEMO_ACCOUNT_PREFIX ?? 'mobile';

const DEFAULT_API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080/api' : 'http://localhost:8080/api';

export const API_BASE_URL = normalizeBaseUrl(
  process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
);

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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body: requestBody,
  });

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
    description: dto.description,
    reportPhotoUrl: dto.reportPhotoUrl,
    status: normalizeReportStatus(dto.status),
    requestedPickupTime: dto.requestedPickupTime,
    createdAt: dto.createdAt,
  };
}

function toTaskAssignment(dto: TaskDto): TaskAssignment {
  const assignmentStatus = normalizeAssignmentStatus(dto.assignmentStatus ?? dto.status);

  const task: Task = {
    taskId: dto.taskId,
    reportId: dto.reportId,
    enterpriseUserId: dto.enterpriseUserId,
    enterpriseName: dto.enterpriseName,
    createdByUserId: dto.createdByUserId,
    areaId: dto.areaId,
    areaName: dto.areaName,
    status: (dto.status ?? 'ASSIGNED') as Task['status'],
    priority: dto.priority,
    scheduledDate: dto.scheduledDate,
    rejectionReason: dto.rejectionReason,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
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

export async function fetchLeaderboard(limit = 20) {
  const data = await request<
    {
      rank: number;
      citizenUserId: string;
      displayName: string;
      avatarUrl?: string;
      points: number;
    }[]
  >(`/rewards/leaderboard?limit=${limit}`);

  return data.map(toLeaderboardEntry);
}

export async function fetchMyProfile(token: string) {
  const dto = await request<{
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string;
    phone?: string;
    avatarUrl?: string;
    role: string;
    accountStatus: User['accountStatus'];
  }>('/users/me', { token });

  const user: User = {
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

  return user;
}

export async function fetchCollectorTasks(token: string, size = 50) {
  const page = await request<PageResponse<TaskDto>>(`/collector/tasks?page=0&size=${size}`, {
    token,
  });

  return page.content.map(toTaskAssignment);
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

export async function completeCollectorTask(token: string, taskId: string, note?: string) {
  const dto = await request<TaskDto>(`/collector/tasks/${taskId}/complete`, {
    method: 'POST',
    token,
    body: {
      visitStatus: 'SUCCESS',
      collectorNote: note ?? 'Completed from mobile app',
      photoUrls: [],
      wasteItems: [],
    },
  });

  return toTaskAssignment(dto);
}

export async function fetchCollectorKpiToday(token: string) {
  const dto = await request<KpiDto>('/collector/kpi/today', { token });
  return toCollectorKpi(dto);
}
