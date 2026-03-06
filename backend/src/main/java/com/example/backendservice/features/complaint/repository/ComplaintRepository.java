package com.example.backendservice.features.complaint.repository;

import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.entity.ComplaintCategory;
import com.example.backendservice.features.complaint.entity.ComplaintPriority;
import com.example.backendservice.features.complaint.entity.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID>, JpaSpecificationExecutor<Complaint> {

        Optional<Complaint> findByComplaintId(UUID complaintId);

        Page<Complaint> findByCreatedByUserUserId(UUID userId, Pageable pageable);

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
        long countByStatus(@Param("status") ComplaintStatus status);

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.category = :category")
        long countByCategory(@Param("category") ComplaintCategory category);

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.priority = :priority")
        long countByPriority(@Param("priority") ComplaintPriority priority);
}
