package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.complaint.*;
import com.wastecollection.entity.*;
import com.wastecollection.exception.ForbiddenException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintResolutionRepository resolutionRepository;
    private final UserRepository userRepository;
    private final WasteReportRepository reportRepository;
    private final CollectionVisitRepository visitRepository;

    @Transactional
    public ComplaintDto createComplaint(UUID submitterId, CreateComplaintRequest request) {
        User submitter = userRepository.findById(submitterId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", submitterId));

        Complaint complaint = Complaint.builder()
                .createdBy(submitter)
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory())
                .priority(request.getPriority() != null ? request.getPriority() : "Normal")
                .status("Pending")
                .build();

        if (request.getReportId() != null) {
            WasteReport report = reportRepository.findById(request.getReportId())
                    .orElseThrow(() -> new ResourceNotFoundException("Report", "id", request.getReportId()));
            complaint.setReport(report);
        }

        if (request.getVisitId() != null) {
            CollectionVisit visit = visitRepository.findById(request.getVisitId())
                    .orElseThrow(() -> new ResourceNotFoundException("Visit", "id", request.getVisitId()));
            complaint.setVisit(visit);
        }

        return mapToDto(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public ComplaintDto getComplaint(UUID complaintId, UUID requesterId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));
        // The submitter or an admin/enterprise can view the complaint
        return mapToDto(complaint);
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplaintDto> getMyComplaints(UUID userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Complaint> complaints = complaintRepository.findByCreatedBy_UserId(userId, pageable);
        return toPageResponse(complaints);
    }

    @Transactional(readOnly = true)
    public PageResponse<ComplaintDto> getAllComplaints(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Complaint> complaints = status != null
                ? complaintRepository.findByStatus(status, pageable)
                : complaintRepository.findAll(pageable);
        return toPageResponse(complaints);
    }

    @Transactional
    public ComplaintDto resolveComplaint(UUID complaintId, UUID adminId, ResolveComplaintRequest request) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint", "id", complaintId));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", adminId));

        ComplaintResolution resolution = ComplaintResolution.builder()
                .complaint(complaint)
                .admin(admin)
                .decision(request.getDecision())
                .note(request.getNote())
                .isAccepted(request.getIsAccepted())
                .resolvedAt(LocalDateTime.now())
                .build();
        resolutionRepository.save(resolution);

        complaint.setStatus("Resolved");
        complaint.setAdminResponse(request.getAdminResponse());
        complaint.setResolvedAt(LocalDateTime.now());
        return mapToDto(complaintRepository.save(complaint));
    }

    public ComplaintDto mapToDto(Complaint c) {
        return ComplaintDto.builder()
                .complaintId(c.getComplaintId())
                .createdByUserId(c.getCreatedBy().getUserId())
                .createdByName(c.getCreatedBy().getDisplayName())
                .reportId(c.getReport() != null ? c.getReport().getReportId() : null)
                .visitId(c.getVisit() != null ? c.getVisit().getVisitId() : null)
                .title(c.getTitle())
                .content(c.getContent())
                .category(c.getCategory())
                .priority(c.getPriority())
                .status(c.getStatus())
                .adminResponse(c.getAdminResponse())
                .createdAt(c.getCreatedAt())
                .resolvedAt(c.getResolvedAt())
                .build();
    }

    private PageResponse<ComplaintDto> toPageResponse(Page<Complaint> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
