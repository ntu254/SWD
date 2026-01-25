package com.example.backendservice.features.complaint.service;

import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface ComplaintService {

    // Citizen operations
    ComplaintResponse createComplaint(Long citizenId, CreateComplaintRequest request);

    Page<ComplaintResponse> getComplaintsByCitizen(Long citizenId, Pageable pageable);

    ComplaintResponse getComplaintById(Long complaintId);

    // Admin operations
    Page<ComplaintResponse> getAllComplaints(String status, String category, String priority, Pageable pageable);

    ComplaintResponse updateComplaintStatus(Long complaintId, UpdateComplaintStatusRequest request);

    void deleteComplaint(Long complaintId);

    Map<String, Long> getComplaintStatistics();
}
