package com.example.backendservice.features.complaint.service;

import com.example.backendservice.common.sse.SseEventData;
import com.example.backendservice.common.sse.SseService;
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
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final CitizenRepository citizenRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

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
        ComplaintResponse response = mapToResponse(savedComplaint);

        // Notify admins about new complaint via SSE
        notifyAdminsNewComplaint(response);

        return response;
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

        String oldStatus = complaint.getStatus();

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
        ComplaintResponse response = mapToResponse(updatedComplaint);

        // Notify citizen about status change via SSE
        if (!oldStatus.equals(response.getStatus())) {
            notifyCitizenComplaintUpdate(response);
        }

        return response;
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

    /**
     * Notify admins about new complaint via SSE
     */
    private void notifyAdminsNewComplaint(ComplaintResponse complaint) {
        try {
            SseEventData eventData = SseEventData.builder()
                    .eventType("NEW_COMPLAINT")
                    .payload(Map.of(
                            "id", complaint.getId(),
                            "title", complaint.getTitle(),
                            "category", complaint.getCategory(),
                            "priority", complaint.getPriority(),
                            "citizenName", complaint.getCitizenName() != null ? complaint.getCitizenName() : "Unknown"))
                    .timestamp(LocalDateTime.now())
                    .targetAudience("Admin")
                    .build();
            sseService.sendEvent(eventData);
            log.info("SSE notification sent to admins: New complaint #{}", complaint.getId());
        } catch (Exception e) {
            log.error("Failed to send SSE notification for new complaint: {}", e.getMessage());
        }
    }

    /**
     * Notify citizen about complaint status update via SSE
     */
    private void notifyCitizenComplaintUpdate(ComplaintResponse complaint) {
        try {
            SseEventData eventData = SseEventData.complaintUpdate(
                    Map.of(
                            "id", complaint.getId(),
                            "title", complaint.getTitle(),
                            "status", complaint.getStatus(),
                            "adminResponse", complaint.getAdminResponse() != null ? complaint.getAdminResponse() : ""),
                    complaint.getCitizenId().toString());
            sseService.sendEvent(eventData);
            log.info("SSE notification sent to citizen {}: Complaint #{} status updated to {}",
                    complaint.getCitizenId(), complaint.getId(), complaint.getStatus());
        } catch (Exception e) {
            log.error("Failed to send SSE notification for complaint update: {}", e.getMessage());
        }
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
