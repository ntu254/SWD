export enum ComplaintStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In_Progress',
    RESOLVED = 'Resolved',
    REJECTED = 'Rejected',
}

export enum ComplaintCategory {
    POINTS_ERROR = 'POINTS_ERROR',
    BUG = 'BUG',
    SERVICE_ISSUE = 'SERVICE_ISSUE',
    OTHER = 'OTHER',
}

export enum ComplaintPriority {
    LOW = 'Low',
    NORMAL = 'Normal',
    HIGH = 'High',
    URGENT = 'Urgent',
}

export interface ComplaintResponse {
    id: string;
    citizenId: string;
    citizenName: string;
    citizenEmail: string;
    title: string;
    description: string;
    category: ComplaintCategory;
    status: ComplaintStatus;
    priority: ComplaintPriority;
    adminResponse?: string;
    resolvedById?: string;
    resolvedByName?: string;
    resolvedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateComplaintStatusRequest {
    status: ComplaintStatus;
    adminResponse: string;
    resolvedById: string;
}

export interface ComplaintFilters {
    status?: ComplaintStatus | '';
    category?: ComplaintCategory | '';
    priority?: ComplaintPriority | '';
    search?: string;
}

export interface ComplaintStatistics {
    Pending: number;
    In_Progress: number;
    Resolved: number;
    Rejected: number;
}

export interface PageResponse<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
}
