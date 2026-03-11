// Enums
export enum NotificationType {
    GENERAL = 'General',
    MAINTENANCE = 'Maintenance',
    UPDATE = 'Update',
    ALERT = 'Alert',
    PROMOTION = 'Promotion',
}

export enum TargetAudience {
    ALL = 'All',
    CITIZEN = 'Citizen',
    COLLECTOR = 'Collector',
    ENTERPRISE = 'Enterprise',
}

export enum Priority {
    LOW = 'Low',
    NORMAL = 'Normal',
    HIGH = 'High',
    URGENT = 'Urgent',
}

// Response from backend
export interface NotificationResponse {
    id: string;
    title: string;
    content: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    priority: Priority;
    isActive: boolean;
    startDate?: string; // ISO 8601 datetime
    endDate?: string; // ISO 8601 datetime
    createdById: string;
    createdByName: string;
    createdAt: string;
    updatedAt: string;
}

// Request for creating notification
export interface CreateNotificationRequest {
    title: string;
    content: string;
    type?: NotificationType;
    targetAudience?: TargetAudience;
    priority?: Priority;
    startDate?: string;
    endDate?: string;
}

// Request for updating notification
export interface UpdateNotificationRequest {
    title?: string;
    content?: string;
    type?: NotificationType;
    targetAudience?: TargetAudience;
    priority?: Priority;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
}

// Filters for notification list
export interface NotificationFilters {
    type?: NotificationType;
    targetAudience?: TargetAudience;
    isActive?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
}

// Form data for create/edit
export interface NotificationFormData {
    title: string;
    content: string;
    type: NotificationType;
    targetAudience: TargetAudience;
    priority: Priority;
    startDate?: Date | null;
    endDate?: Date | null;
}

// Pagination response
export interface PageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}
