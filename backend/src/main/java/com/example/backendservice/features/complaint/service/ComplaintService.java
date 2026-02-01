package com.example.backendservice.features.complaint.service;

import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;
import java.util.UUID;

public interface ComplaintService {

    // Citizen operations
    ComplaintResponse createComplaint(UUID citizenId, CreateComplaintRequest request);

    Page<ComplaintResponse> getComplaintsByCitizen(UUID citizenId, Pageable pageable);

    ComplaintResponse getComplaintById(UUID complaintId);

    // Enterprise operations
    Page<ComplaintResponse> getComplaintsByEnterprise(UUID enterpriseId, Pageable pageable);

    Page<ComplaintResponse> getComplaintsByCollector(UUID collectorId, Pageable pageable);

    ComplaintResponse startInvestigation(UUID complaintId, UUID adminId);

    ComplaintResponse resolveComplaint(UUID complaintId, UUID adminId, String response);

    ComplaintResponse rejectComplaint(UUID complaintId, UUID adminId, String reason);

    // Admin operations
    Page<ComplaintResponse> getAllComplaints(String status, String category, String priority, Pageable pageable);

    ComplaintResponse updateComplaintStatus(UUID complaintId, UpdateComplaintStatusRequest request);

    void deleteComplaint(UUID complaintId);

    Map<String, Long> getComplaintStatistics();

    long countComplaintsByCollector(UUID collectorId);
}
