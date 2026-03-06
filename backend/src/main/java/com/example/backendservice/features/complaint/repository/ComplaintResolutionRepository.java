package com.example.backendservice.features.complaint.repository;

import com.example.backendservice.features.complaint.entity.ComplaintResolution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintResolutionRepository extends JpaRepository<ComplaintResolution, UUID> {

    Optional<ComplaintResolution> findByResolutionId(UUID resolutionId);

    @Query("SELECT cr FROM ComplaintResolution cr WHERE cr.complaint.complaintId = :complaintId")
    Optional<ComplaintResolution> findByComplaintId(@Param("complaintId") UUID complaintId);

    @Query("SELECT cr FROM ComplaintResolution cr WHERE cr.adminUser.userId = :adminUserId ORDER BY cr.resolvedAt DESC")
    List<ComplaintResolution> findByAdminUserId(@Param("adminUserId") UUID adminUserId);

    @Query("SELECT cr FROM ComplaintResolution cr WHERE cr.decision = :decision ORDER BY cr.resolvedAt DESC")
    List<ComplaintResolution> findByDecision(@Param("decision") String decision);

    @Query("SELECT cr FROM ComplaintResolution cr WHERE cr.isAccepted = :isAccepted ORDER BY cr.resolvedAt DESC")
    List<ComplaintResolution> findByIsAccepted(@Param("isAccepted") Boolean isAccepted);

    @Query("SELECT COUNT(cr) FROM ComplaintResolution cr WHERE cr.adminUser.userId = :adminUserId")
    Long countByAdminUserId(@Param("adminUserId") UUID adminUserId);
}
