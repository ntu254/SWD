import type {
    ComplaintResponse,
    UpdateComplaintStatusRequest,
    ComplaintFilters,
    ComplaintStatistics,
    PageResponse,
} from '@features/complaint-management/types';

// ============================================================================
// TEMPORARY: Using MockAPI for testing
// TODO: Switch back to real API when backend is ready
// ============================================================================
const MOCK_API_URL = 'https://697e3fc397386252a26a4250.mockapi.io/api/v1/complaints';

// ============================================================================
// REAL API INTEGRATION (Commented out - uncomment when backend is ready)
// ============================================================================
// import apiClient from './client';
// const BASE_URL = '/complaints';

export const complaintService = {
    // Get all complaints with filters
    getAllComplaints: async (
        filters: ComplaintFilters,
        page: number = 0,
        size: number = 10
    ): Promise<PageResponse<ComplaintResponse>> => {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            // Fetch all data from MockAPI
            const response = await fetch(MOCK_API_URL);
            const allComplaints: ComplaintResponse[] = await response.json();

            // Apply filters
            let filtered = allComplaints;

            if (filters.status) {
                filtered = filtered.filter((c) => c.status === filters.status);
            }
            if (filters.category) {
                filtered = filtered.filter((c) => c.category === filters.category);
            }
            if (filters.priority) {
                filtered = filtered.filter((c) => c.priority === filters.priority);
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filtered = filtered.filter(
                    (c) =>
                        c.title.toLowerCase().includes(searchLower) ||
                        c.description.toLowerCase().includes(searchLower)
                );
            }

            // Sort by createdAt desc
            filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Pagination
            const start = page * size;
            const end = start + size;
            const paginatedData = filtered.slice(start, end);

            return {
                content: paginatedData,
                pageNumber: page,
                pageSize: size,
                totalElements: filtered.length,
                totalPages: Math.ceil(filtered.length / size),
            };
        } catch (error) {
            console.error('Error fetching complaints:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // const params = new URLSearchParams({
        //     page: page.toString(),
        //     size: size.toString(),
        //     sortBy: 'createdAt',
        //     sortDir: 'desc',
        // });
        //
        // if (filters.status) params.append('status', filters.status);
        // if (filters.category) params.append('category', filters.category);
        // if (filters.priority) params.append('priority', filters.priority);
        //
        // return apiClient.get(`${BASE_URL}/admin?${params.toString()}`);
    },

    // Get complaint by ID
    getComplaintById: async (id: string): Promise<ComplaintResponse> => {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(`${MOCK_API_URL}/${id}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching complaint:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // return apiClient.get(`${BASE_URL}/${id}`);
    },

    // Update complaint status
    updateComplaintStatus: async (
        id: string,
        request: UpdateComplaintStatusRequest
    ): Promise<ComplaintResponse> => {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: request.status,
                    adminResponse: request.adminResponse,
                    resolvedById: request.resolvedById,
                    resolvedByName: 'Admin User', // Mock admin name
                    resolvedAt: request.status === 'Resolved' ? new Date().toISOString() : null,
                    updatedAt: new Date().toISOString(),
                }),
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating complaint:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // return apiClient.put(`${BASE_URL}/admin/${id}/status`, request);
    },

    // Delete complaint
    deleteComplaint: async (id: string): Promise<void> => {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            await fetch(`${MOCK_API_URL}/${id}`, {
                method: 'DELETE',
            });
        } catch (error) {
            console.error('Error deleting complaint:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // return apiClient.delete(`${BASE_URL}/admin/${id}`);
    },

    // Get statistics
    getStatistics: async (): Promise<ComplaintStatistics> => {
        // ========== MOCK API IMPLEMENTATION ==========
        try {
            const response = await fetch(MOCK_API_URL);
            const complaints: ComplaintResponse[] = await response.json();

            const stats: ComplaintStatistics = {
                Pending: complaints.filter((c) => c.status === 'Pending').length,
                In_Progress: complaints.filter((c) => c.status === 'In_Progress').length,
                Resolved: complaints.filter((c) => c.status === 'Resolved').length,
                Rejected: complaints.filter((c) => c.status === 'Rejected').length,
            };

            return stats;
        } catch (error) {
            console.error('Error fetching statistics:', error);
            throw error;
        }

        // ========== REAL API IMPLEMENTATION (Commented) ==========
        // return apiClient.get(`${BASE_URL}/admin/statistics`);
    },
};
