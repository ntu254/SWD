// This file contains types that map exactly to the Java Backend DTOs.

export interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role: 'ADMIN' | 'ENTERPRISE' | 'CITIZEN' | 'COLLECTOR';
  accountStatus: 'ACTIVE' | 'DISABLED' | 'BANNED' | 'PENDING_DELETE';
  createdAt: string;
}

export interface WasteReport {
  reportId: string;
  reporterUserId: string;
  reporterName: string;
  wasteTypeId: string;
  wasteTypeName: string;
  areaId?: string | null;
  areaName?: string | null;
  latitude: number;
  longitude: number;
  gpsAccuracyMeters?: number | null;
  description?: string | null;
  estimatedWeightKg?: number | null;
  reportPhotoUrl?: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'ON_THE_WAY' | 'COLLECTED' | 'REJECTED' | 'CANCELLED';
  requestedPickupTime?: string | null;
  createdAt: string;
}

export interface Task {
  taskId: string;
  reportId?: string | null;
  enterpriseUserId: string;
  enterpriseName: string;
  createdByUserId: string;
  collectorUserId?: string | null;
  collectorName?: string | null;
  assignmentStatus?: string | null;
  areaId?: string | null;
  areaName?: string | null;
  status:
    | 'PENDING_ENTERPRISE_APPROVAL'
    | 'ASSIGNED'
    | 'ON_THE_WAY'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'COLLECTED';
  priority?: string | null;
  scheduledDate?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}
