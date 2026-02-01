import { useState, useCallback, useEffect } from 'react';
import { complaintService } from '@shared/services/api/complaintService';
import type {
    ComplaintResponse,
    UpdateComplaintStatusRequest,
    ComplaintFilters,
    ComplaintStatistics,
} from '../types';

export const useComplaints = () => {
    const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
    const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
    const [statistics, setStatistics] = useState<ComplaintStatistics | null>(null);
    const [filters, setFilters] = useState<ComplaintFilters>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Fetch complaints
    const fetchComplaints = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await complaintService.getAllComplaints(filters, currentPage, 3);
            setComplaints(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch complaints');
            console.error('Fetch complaints error:', err);
        } finally {
            setLoading(false);
        }
    }, [filters, currentPage]);

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await complaintService.getStatistics();
            setStatistics(stats);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    }, []);

    // Update complaint status
    const updateStatus = useCallback(
        async (id: string, request: UpdateComplaintStatusRequest) => {
            try {
                const updated = await complaintService.updateComplaintStatus(id, request);
                setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)));
                setSelectedComplaint(updated);
                await fetchStatistics();
                return true;
            } catch (err: any) {
                throw new Error(err.message || 'Failed to update status');
            }
        },
        [fetchStatistics]
    );

    // Delete complaint
    const deleteComplaint = useCallback(
        async (id: string) => {
            try {
                await complaintService.deleteComplaint(id);
                setComplaints((prev) => prev.filter((c) => c.id !== id));
                if (selectedComplaint?.id === id) {
                    setSelectedComplaint(null);
                }
                await fetchStatistics();
                return true;
            } catch (err: any) {
                throw new Error(err.message || 'Failed to delete complaint');
            }
        },
        [selectedComplaint, fetchStatistics]
    );

    // Handle filter change
    const handleFilterChange = (newFilters: ComplaintFilters) => {
        setFilters(newFilters);
        setCurrentPage(0); // Reset to first page
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    // Handle select complaint
    const handleSelectComplaint = (complaint: ComplaintResponse | null) => {
        setSelectedComplaint(complaint);
    };

    // Initial fetch
    useEffect(() => {
        fetchComplaints();
        fetchStatistics();
    }, [fetchComplaints, fetchStatistics]);

    return {
        complaints,
        selectedComplaint,
        setSelectedComplaint: handleSelectComplaint,
        statistics,
        filters,
        setFilters: handleFilterChange,
        loading,
        error,
        currentPage,
        setCurrentPage: handlePageChange,
        totalPages,
        totalElements,
        updateStatus,
        deleteComplaint,
        refetch: fetchComplaints,
    };
};
