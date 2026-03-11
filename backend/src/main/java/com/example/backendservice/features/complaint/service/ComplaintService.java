package com.example.backendservice.features.complaint.service;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.complaint.dto.*;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.complaint.entity.ComplaintCategory;
import com.example.backendservice.features.complaint.entity.ComplaintPriority;
import com.example.backendservice.features.complaint.entity.ComplaintResolution;
import com.example.backendservice.features.complaint.entity.ComplaintStatus;
import com.example.backendservice.features.complaint.repository.ComplaintRepository;
import com.example.backendservice.features.complaint.repository.ComplaintResolutionRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

        private final ComplaintRepository complaintRepository;
        private final ComplaintResolutionRepository resolutionRepository;
        private final UserRepository userRepository;
        private final WasteReportRepository wasteReportRepository;
        private final CollectionVisitRepository visitRepository;

        // ========== Citizen Operations ==========

        @Transactional
        public ComplaintResponse createComplaint(UUID citizenId, CreateComplaintRequest request) {
                User citizen = findUserOrThrow(citizenId);

                WasteReport wasteReport = null;
                if (request.getReportId() != null) {
                        wasteReport = wasteReportRepository.findByReportId(request.getReportId()).orElse(null);
                }

                CollectionVisit visit = null;
                if (request.getVisitId() != null) {
                        visit = visitRepository.findByVisitId(request.getVisitId()).orElse(null);
                }

                Complaint complaint = Complaint.builder()
                                .createdByUser(citizen)
                                .title(request.getTitle())
                                .content(request.getContent())
                                .category(request.getCategory() != null ? request.getCategory() : ComplaintCategory.OTHER)
                                .priority(request.getPriority() != null ? request.getPriority() : ComplaintPriority.Normal)
                                .status(ComplaintStatus.Pending)
                                .wasteReport(wasteReport)
                                .visit(visit)
                                .build();

                complaint = complaintRepository.save(complaint);
                log.info("Complaint created [id={}, citizen={}]", complaint.getComplaintId(), citizenId);
                return toResponse(complaint);
        }

        public Page<ComplaintResponse> getCitizenComplaints(UUID citizenId, Pageable pageable) {
                return complaintRepository.findByCreatedByUserUserId(citizenId, pageable)
                                .map(this::toResponse);
        }

        // ========== Public Operations ==========

        public ComplaintResponse getComplaintById(UUID complaintId) {
                Complaint complaint = findComplaintOrThrow(complaintId);
                return toResponse(complaint);
        }

        // ========== Admin Operations ==========

        public Page<ComplaintResponse> getAllComplaints(ComplaintStatus status, ComplaintCategory category,
                        ComplaintPriority priority,
                        Pageable pageable) {
                Specification<Complaint> spec = buildFilterSpec(status, category, priority);
                return complaintRepository.findAll(spec, pageable).map(this::toResponse);
        }

        @Transactional
        public ComplaintResponse updateComplaintStatus(UUID complaintId, UpdateComplaintStatusRequest request) {
                Complaint complaint = findComplaintOrThrow(complaintId);

                complaint.setStatus(request.getStatus());
                if (request.getAdminResponse() != null) {
                        complaint.setAdminResponse(request.getAdminResponse());
                }
                if (request.getStatus() == ComplaintStatus.Resolved
                                || request.getStatus() == ComplaintStatus.Rejected) {
                        complaint.setResolvedAt(LocalDateTime.now());
                }

                complaint = complaintRepository.save(complaint);
                log.info("Complaint status updated [id={}, status={}]", complaintId, request.getStatus());
                return toResponse(complaint);
        }

        @Transactional
        public void deleteComplaint(UUID complaintId) {
                Complaint complaint = findComplaintOrThrow(complaintId);
                complaintRepository.delete(complaint);
                log.info("Complaint deleted [id={}]", complaintId);
        }

        public ComplaintStatisticsResponse getStatistics() {
                long total = complaintRepository.count();

                Map<String, Long> byStatus = new LinkedHashMap<>();
                for (ComplaintStatus status : ComplaintStatus.values()) {
                        byStatus.put(status.name(), complaintRepository.countByStatus(status));
                }

                Map<String, Long> byCategory = new LinkedHashMap<>();
                for (ComplaintCategory category : ComplaintCategory.values()) {
                        byCategory.put(category.name(), complaintRepository.countByCategory(category));
                }

                Map<String, Long> byPriority = new LinkedHashMap<>();
                for (ComplaintPriority priority : ComplaintPriority.values()) {
                        byPriority.put(priority.name(), complaintRepository.countByPriority(priority));
                }

                return ComplaintStatisticsResponse.builder()
                                .totalComplaints(total)
                                .byStatus(byStatus)
                                .byCategory(byCategory)
                                .byPriority(byPriority)
                                .build();
        }

        // ========== Private Helpers ==========

        private Specification<Complaint> buildFilterSpec(ComplaintStatus status, ComplaintCategory category,
                        ComplaintPriority priority) {
                return (root, query, cb) -> {
                        var predicates = new ArrayList<Predicate>();
                        if (status != null) {
                                predicates.add(cb.equal(root.get("status"), status));
                        }
                        if (category != null) {
                                predicates.add(cb.equal(root.get("category"), category));
                        }
                        if (priority != null) {
                                predicates.add(cb.equal(root.get("priority"), priority));
                        }
                        return cb.and(predicates.toArray(new Predicate[0]));
                };
        }

        private User findUserOrThrow(UUID userId) {
                return userRepository.findByUserId(userId)
                                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        }

        private Complaint findComplaintOrThrow(UUID complaintId) {
                return complaintRepository.findByComplaintId(complaintId)
                                .orElseThrow(() -> new IllegalArgumentException("Complaint not found: " + complaintId));
        }

        private ComplaintResponse toResponse(Complaint c) {
                ComplaintResolution resolution = resolutionRepository.findByComplaintId(c.getComplaintId())
                                .orElse(null);

                return ComplaintResponse.builder()
                                .complaintId(c.getComplaintId())
                                .createdByUserId(c.getCreatedByUserId())
                                .createdByUserName(c.getCreatedByUser() != null ? c.getCreatedByUser().getFullName()
                                                : null)
                                .title(c.getTitle())
                                .content(c.getContent())
                                .category(c.getCategory())
                                .priority(c.getPriority())
                                .status(c.getStatus())
                                .adminResponse(c.getAdminResponse())
                                .reportId(c.getWasteReport() != null ? c.getWasteReport().getReportId() : null)
                                .visitId(c.getVisit() != null ? c.getVisit().getVisitId() : null)
                                .createdAt(c.getCreatedAt())
                                .updatedAt(c.getUpdatedAt())
                                .resolvedAt(c.getResolvedAt())
                                .rewardTransactionId(c.getRewardTransaction() != null
                                                ? c.getRewardTransaction().getTransactionId()
                                                : null)
                                .resolution(resolution != null ? toResolutionResponse(resolution) : null)
                                .build();
        }

        private ComplaintResolutionResponse toResolutionResponse(ComplaintResolution r) {
                return ComplaintResolutionResponse.builder()
                                .resolutionId(r.getResolutionId())
                                .complaintId(r.getComplaintId())
                                .adminUserId(r.getAdminUserId())
                                .adminUserName(r.getAdminUser() != null ? r.getAdminUser().getFullName() : null)
                                .decision(r.getDecision())
                                .note(r.getNote())
                                .isAccepted(r.getIsAccepted())
                                .resolvedAt(r.getResolvedAt())
                                .build();
        }
}
