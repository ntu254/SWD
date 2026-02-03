package com.example.backendservice.features.complaint.service;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.complaint.dto.*;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.entity.ComplaintResolution;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.complaint.repository.ComplaintResolutionRepository;
import com.example.backendservice.features.reward.service.RewardService;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

        private final ComplaintRepository complaintRepository;
        private final ComplaintResolutionRepository resolutionRepository;
        private final UserRepository userRepository;
        private final WasteReportRepository wasteReportRepository;
        private final CollectionVisitRepository visitRepository;
        private final RewardService rewardService;

        @Transactional
        public ComplaintResponse createComplaint(UUID userId, CreateComplaintRequest request) {
                User user = userRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

                WasteReport wasteReport = null;
                if (request.getReportId() != null) {
                        wasteReport = wasteReportRepository.findByReportId(request.getReportId()).orElse(null);
                }

                CollectionVisit visit = null;
                if (request.getVisitId() != null) {
                        visit = visitRepository.findByVisitId(request.getVisitId()).orElse(null);
                }

                Complaint complaint = Complaint.builder()
                                .createdByUser(user)
                                .wasteReport(wasteReport)
                                .visit(visit)
                                .content(request.getContent())
                                .status("OPEN")
                                .build();

                complaint = complaintRepository.save(complaint);
                log.info("Created complaint {} by user {}", complaint.getComplaintId(), userId);

                return toResponse(complaint);
        }

        @Transactional
        public ComplaintResponse resolveComplaint(UUID adminUserId, ResolveComplaintRequest request) {
                User admin = userRepository.findByUserId(adminUserId)
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Admin user not found: " + adminUserId));

                Complaint complaint = complaintRepository.findByComplaintId(request.getComplaintId())
                                .orElseThrow(() -> new IllegalArgumentException(
                                                "Complaint not found: " + request.getComplaintId()));

                // Create resolution
                ComplaintResolution resolution = ComplaintResolution.builder()
                                .complaint(complaint)
                                .adminUser(admin)
                                .decision(request.getDecision())
                                .note(request.getNote())
                                .isAccepted(request.getIsAccepted())
                                .resolvedAt(LocalDateTime.now())
                                .build();

                resolution = resolutionRepository.save(resolution);

                // Update complaint status
                complaint.setStatus("RESOLVED");

                // If compensating, create reward transaction
                if ("COMPENSATE".equals(request.getDecision()) && request.getCompensationPoints() != null
                                && request.getCompensationPoints() > 0) {
                        // Get citizen user from complaint
                        UUID citizenUserId = complaint.getCreatedByUserId();
                        if (citizenUserId != null) {
                                rewardService.earnPoints(citizenUserId, request.getCompensationPoints().intValue(),
                                                "COMPENSATION for complaint " + complaint.getComplaintId(),
                                                complaint.getComplaintId());
                        }
                }

                complaint = complaintRepository.save(complaint);
                log.info("Resolved complaint {} by admin {} with decision {}", request.getComplaintId(), adminUserId,
                                request.getDecision());

                return toResponse(complaint);
        }

        public ComplaintResponse getComplaintById(UUID complaintId) {
                Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
                return toResponse(complaint);
        }

        public List<ComplaintResponse> getComplaintsByUserId(UUID userId) {
                return complaintRepository.findByCreatedByUserId(userId).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public List<ComplaintResponse> getOpenComplaints() {
                return complaintRepository.findOpenComplaints().stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        public List<ComplaintResponse> getComplaintsByStatus(String status) {
                return complaintRepository.findByStatus(status).stream()
                                .map(this::toResponse)
                                .collect(Collectors.toList());
        }

        private ComplaintResponse toResponse(Complaint complaint) {
                ComplaintResolution resolution = resolutionRepository.findByComplaintId(complaint.getComplaintId())
                                .orElse(null);

                return ComplaintResponse.builder()
                                .complaintId(complaint.getComplaintId())
                                .createdByUserId(complaint.getCreatedByUserId())
                                .createdByUserName(
                                                complaint.getCreatedByUser() != null
                                                                ? complaint.getCreatedByUser().getFullName()
                                                                : null)
                                .reportId(complaint.getWasteReport() != null ? complaint.getWasteReport().getReportId()
                                                : null)
                                .visitId(complaint.getVisit() != null ? complaint.getVisit().getVisitId() : null)
                                .content(complaint.getContent())
                                .status(complaint.getStatus())
                                .createdAt(complaint.getCreatedAt())
                                .rewardTransactionId(
                                                complaint.getRewardTransaction() != null
                                                                ? complaint.getRewardTransaction().getTransactionId()
                                                                : null)
                                .resolution(resolution != null ? toResolutionResponse(resolution) : null)
                                .build();
        }

        private ComplaintResolutionResponse toResolutionResponse(ComplaintResolution resolution) {
                return ComplaintResolutionResponse.builder()
                                .resolutionId(resolution.getResolutionId())
                                .complaintId(resolution.getComplaintId())
                                .adminUserId(resolution.getAdminUserId())
                                .adminUserName(resolution.getAdminUser() != null
                                                ? resolution.getAdminUser().getFullName()
                                                : null)
                                .decision(resolution.getDecision())
                                .note(resolution.getNote())
                                .isAccepted(resolution.getIsAccepted())
                                .resolvedAt(resolution.getResolvedAt())
                                .build();
        }
}
