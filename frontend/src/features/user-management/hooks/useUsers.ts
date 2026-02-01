import { useState, useCallback } from 'react';
import { userManagementService } from '@services/api/userManagementService';
import type {
    AdminUserResponse,
    CreateUserRequest,
    UpdateUserRequest,
    UpdateUserStatusRequest,
    UserFilters,
    PaginatedResponse
} from '../types';

interface UseUsersReturn {
    users: AdminUserResponse[];
    pagination: {
        total: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
    };
    loading: boolean;
    error: string | null;
    fetchUsers: (filters?: UserFilters) => Promise<void>;
    createUser: (data: CreateUserRequest) => Promise<void>;
    updateUser: (id: number, data: UpdateUserRequest) => Promise<void>;
    updateUserStatus: (id: number, data: UpdateUserStatusRequest) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    restoreUser: (id: number) => Promise<void>;
}

export const useUsers = (): UseUsersReturn => {
    const [users, setUsers] = useState<AdminUserResponse[]>([]);
    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (filters: UserFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response: PaginatedResponse<AdminUserResponse> =
                await userManagementService.getAllUsers(filters);

            setUsers(response.content);
            setPagination({
                total: response.totalElements,
                totalPages: response.totalPages,
                currentPage: response.number,
                pageSize: response.size,
            });
        } catch (err: any) {
            setError(err.message || 'Failed to fetch users');
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createUser = useCallback(async (data: CreateUserRequest) => {
        setLoading(true);
        setError(null);
        try {
            await userManagementService.createUser(data);
        } catch (err: any) {
            setError(err.message || 'Failed to create user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUser = useCallback(async (id: number, data: UpdateUserRequest) => {
        setLoading(true);
        setError(null);
        try {
            await userManagementService.updateUser(id, data);
        } catch (err: any) {
            setError(err.message || 'Failed to update user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateUserStatus = useCallback(
        async (id: number, data: UpdateUserStatusRequest) => {
            setLoading(true);
            setError(null);
            try {
                await userManagementService.updateUserStatus(id, data);
            } catch (err: any) {
                setError(err.message || 'Failed to update user status');
                throw err;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const deleteUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await userManagementService.deleteUser(id);
        } catch (err: any) {
            setError(err.message || 'Failed to delete user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const restoreUser = useCallback(async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await userManagementService.restoreUser(id);
        } catch (err: any) {
            setError(err.message || 'Failed to restore user');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        users,
        pagination,
        loading,
        error,
        fetchUsers,
        createUser,
        updateUser,
        updateUserStatus,
        deleteUser,
        restoreUser,
    };
};

export default useUsers;
