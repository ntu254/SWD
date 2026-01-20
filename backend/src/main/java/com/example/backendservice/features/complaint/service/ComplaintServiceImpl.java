package com.example.backendservice.features.complaint.service;

import com.example.backendservice.features.complaint.dto.ComplaintResponse;
import com.example.backendservice.features.complaint.dto.CreateComplaintRequest;
import com.example.backendservice.features.complaint.dto.UpdateComplaintStatusRequest;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;

    @Override
    public ComplaintResponse createComplaint(Long citizenId, CreateComplaintRequest request) {
        Citizen citizen = citizenRepository.findById(citizenId)
                .orElseThrow(() -> new RuntimeException("Citizen not found with id: " + citizenId));

        Complaint complaint = Complaint.builder()
                .citizen(citizen)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "OTHER")
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .status("Pending")
                .build();

        Complaint savedComplaint = complaintRepository.save(complaint);
        return mapToResponse(savedComplaint);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getComplaintsByCitizen(Long citizenId, Pageable pageable) {
        return complaintRepository.findByCitizenId(citizenId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ComplaintResponse getComplaintById(Long complaintId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));
        return mapToResponse(complaint);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ComplaintResponse> getAllComplaints(String status, String category, String priority,
            Pageable pageable) {
        return complaintRepository.findAllWithFilters(status, category, priority, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ComplaintResponse updateComplaintStatus(Long complaintId, UpdateComplaintStatusRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with id: " + complaintId));

        if (request.getStatus() != null) {
            complaint.setStatus(request.getStatus());

            if ("Resolved".equals(request.getStatus()) || "Rejected".equals(request.getStatus())) {
                complaint.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getAdminResponse() != null) {
            complaint.setAdminResponse(request.getAdminResponse());
        }

        if (request.getResolvedById() != null) {
            User admin = userRepository.findById(request.getResolvedById())
                    .orElseThrow(() -> new RuntimeException("Admin not found with id: " + request.getResolvedById()));
            complaint.setResolvedBy(admin);
        }

        Complaint updatedComplaint = complaintRepository.save(complaint);
        return mapToResponse(updatedComplaint);
    }

    @Override
    public void deleteComplaint(Long complaintId) {
        if (!complaintRepository.existsById(complaintId)) {
            throw new RuntimeException("Complaint not found with id: " + complaintId);
        }
        complaintRepository.deleteById(complaintId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> getComplaintStatistics() {
        Map<String, Long> stats = new HashMap<>();
        List<Object[]> results = complaintRepository.getComplaintStatsByStatus();

        for (Object[] result : results) {
            String status = (String) result[0];
            Long count = (Long) result[1];
            stats.put(status, count);
        }

        stats.put("total", complaintRepository.count());
        return stats;
    }

    private ComplaintResponse mapToResponse(Complaint complaint) {
        ComplaintResponse.ComplaintResponseBuilder builder = ComplaintResponse.builder()
                .id(complaint.getId())
                .citizenId(complaint.getCitizen().getId())
                .title(complaint.getTitle())
                .description(complaint.getDescription())
                .category(complaint.getCategory())
                .status(complaint.getStatus())
                .priority(complaint.getPriority())
                .adminResponse(complaint.getAdminResponse())
                .resolvedAt(complaint.getResolvedAt())
                .createdAt(complaint.getCreatedAt())
                .updatedAt(complaint.getUpdatedAt());

        if (complaint.getCitizen() != null && complaint.getCitizen().getUser() != null) {
            builder.citizenName(complaint.getCitizen().getUser().getFullName());
            builder.citizenEmail(complaint.getCitizen().getUser().getEmail());
        }

        if (complaint.getResolvedBy() != null) {
            builder.resolvedById(complaint.getResolvedBy().getId());
            builder.resolvedByName(complaint.getResolvedBy().getFullName());
        }

        return builder.build();
    }
}
