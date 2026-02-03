package com.example.backendservice.features.complaint.repository;

import com.example.backendservice.features.complaint.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, UUID> {

        Optional<Complaint> findByComplaintId(UUID complaintId);

        @Query("SELECT c FROM Complaint c WHERE c.createdByUser.userId = :createdByUserId ORDER BY c.createdAt DESC")
        List<Complaint> findByCreatedByUserId(@Param("createdByUserId") UUID createdByUserId);

        @Query("SELECT c FROM Complaint c WHERE c.wasteReport.reportId = :reportId")
        List<Complaint> findByReportId(@Param("reportId") UUID reportId);

        @Query("SELECT c FROM Complaint c WHERE c.visit.visitId = :visitId")
        List<Complaint> findByVisitId(@Param("visitId") UUID visitId);

        @Query("SELECT c FROM Complaint c WHERE c.status = :status ORDER BY c.createdAt DESC")
        List<Complaint> findByStatus(@Param("status") String status);

        @Query("SELECT c FROM Complaint c WHERE c.status = 'OPEN' ORDER BY c.createdAt ASC")
        List<Complaint> findOpenComplaints();

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.createdByUser.userId = :createdByUserId")
        Long countByCreatedByUserId(@Param("createdByUserId") UUID createdByUserId);

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
        Long countByStatus(@Param("status") String status);
}
