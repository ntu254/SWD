// User Management Types & Interfaces

export type UserRole = 'ADMIN' | 'ENTERPRISE' | 'CITIZEN' | 'COLLECTOR';

export type AccountStatus = 'ACTIVE' | 'DISABLED' | 'BANNED' | 'PENDING_DELETE';

export interface AdminUserResponse {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    userCode: string;
    role: UserRole;
    accountStatus: AccountStatus;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
    deleteScheduledAt?: string;
    banReason?: string;
}

export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'ENTERPRISE' | 'CITIZEN';
    phone: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface UpdateUserRoleRequest {
    role: UserRole;
}

export interface UpdateUserStatusRequest {
    accountStatus: AccountStatus;
    banReason?: string;
}

export interface UserFilters {
    q?: string;
    role?: UserRole;
    enabled?: boolean;
    status?: AccountStatus;
    page?: number;
    size?: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}

export interface ApiPageResponse {
    success: boolean;
    data: PaginatedResponse<AdminUserResponse>;
    message?: string;
    timestamp: string;
}

export interface ApiSingleResponse {
    success: boolean;
    data: AdminUserResponse;
    message?: string;
    timestamp: string;
}
