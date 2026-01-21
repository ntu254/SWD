package com.example.backendservice.features.complaint.repository;

import com.example.backendservice.features.complaint.entity.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {

        // Find all complaints by citizen
        Page<Complaint> findByCitizen_Id(Long citizenId, Pageable pageable);

        // Find complaints by status
        Page<Complaint> findByStatus(String status, Pageable pageable);

        // Find complaints by category
        Page<Complaint> findByCategory(String category, Pageable pageable);

        // Count complaints by status
        long countByStatus(String status);

        // Find all complaints with filters for admin
        @Query("SELECT c FROM Complaint c WHERE " +
                        "(:status IS NULL OR c.status = :status) AND " +
                        "(:category IS NULL OR c.category = :category) AND " +
                        "(:priority IS NULL OR c.priority = :priority)")
        Page<Complaint> findAllWithFilters(
                        @Param("status") String status,
                        @Param("category") String category,
                        @Param("priority") String priority,
                        Pageable pageable);

        // Get complaints statistics
        @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
        List<Object[]> getComplaintStatsByStatus();
}
