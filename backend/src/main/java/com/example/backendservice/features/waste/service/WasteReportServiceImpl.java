package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.repository.CitizenRepository;
import com.example.backendservice.features.waste.dto.CreateWasteReportRequest;
import com.example.backendservice.features.waste.dto.SuggestedReportDTO;
import com.example.backendservice.features.waste.dto.WasteReportResponse;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasteReportServiceImpl implements WasteReportService {

    private final WasteReportRepository wasteReportRepository;
    private final CitizenRepository citizenRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final WasteTypeRepository wasteTypeRepository;

    // Priority scoring weights
    private static final double WEIGHT_FACTOR = 0.30; // Larger weight = higher priority
    private static final double PRIORITY_FACTOR = 0.25; // User priority
    private static final double AGE_FACTOR = 0.25; // Older reports = higher priority
    private static final double WASTE_TYPE_FACTOR = 0.20; // High-value waste types

    @Override
    @Transactional
    public WasteReportResponse createReport(CreateWasteReportRequest request) {
        log.info("Creating waste report for citizen: {}", request.getCitizenId());

        Citizen citizen = citizenRepository.findById(request.getCitizenId())
                .orElseThrow(() -> new EntityNotFoundException("Citizen not found"));

        WasteReport report = WasteReport.builder()
                .citizen(citizen)
                .estimatedWeightKg(request.getEstimatedWeightKg())
                .locationText(request.getLocationText())
                .lat(request.getLat())
                .lng(request.getLng())
                .description(request.getDescription())
                .imageUrls(request.getImageUrls())
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .preferredDate(request.getPreferredDate())
                .status("PENDING")
                .build();

        if (request.getAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getAreaId()).orElse(null);
            report.setArea(area);
        }

        if (request.getPrimaryWasteTypeId() != null) {
            WasteType wasteType = wasteTypeRepository.findById(request.getPrimaryWasteTypeId()).orElse(null);
            report.setPrimaryWasteType(wasteType);
        }

        report = wasteReportRepository.save(report);
        log.info("Created waste report with id: {}", report.getId());

        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public WasteReportResponse getReportById(UUID id) {
        WasteReport report = findById(id);
        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WasteReportResponse> getReportsByCitizen(UUID citizenId, Pageable pageable) {
        return wasteReportRepository.findByCitizenId(citizenId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WasteReportResponse> getReportsByArea(UUID areaId, String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            return wasteReportRepository.findByAreaIdAndStatus(areaId, status, pageable).map(this::mapToResponse);
        }
        return wasteReportRepository.findByAreaId(areaId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WasteReportResponse> getPendingReports(Pageable pageable) {
        return wasteReportRepository.findByStatus("PENDING", pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public WasteReportResponse updateReport(UUID id, CreateWasteReportRequest request) {
        WasteReport report = findById(id);

        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Only PENDING reports can be updated");
        }

        report.setEstimatedWeightKg(request.getEstimatedWeightKg());
        report.setLocationText(request.getLocationText());
        report.setLat(request.getLat());
        report.setLng(request.getLng());
        report.setDescription(request.getDescription());
        report.setImageUrls(request.getImageUrls());
        report.setPreferredDate(request.getPreferredDate());

        if (request.getPriority() != null) {
            report.setPriority(request.getPriority());
        }

        report = wasteReportRepository.save(report);
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse acceptReport(UUID id) {
        WasteReport report = findById(id);
        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Only PENDING reports can be accepted");
        }
        report.setStatus("ACCEPTED");
        report = wasteReportRepository.save(report);
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse rejectReport(UUID id, String reason) {
        WasteReport report = findById(id);
        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Only PENDING reports can be rejected");
        }
        report.setStatus("REJECTED");
        report.setRejectionReason(reason);
        report = wasteReportRepository.save(report);
        return mapToResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse cancelReport(UUID id) {
        WasteReport report = findById(id);
        report.setStatus("CANCELLED");
        report = wasteReportRepository.save(report);
        return mapToResponse(report);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SuggestedReportDTO> getSuggestedReports(UUID enterpriseId, UUID areaId, int limit) {
        log.info("Getting suggested reports for enterprise: {}, area: {}", enterpriseId, areaId);

        List<WasteReport> pendingReports;
        if (areaId != null) {
            pendingReports = wasteReportRepository.findByAreaIdAndStatus(areaId, "PENDING",
                    Pageable.unpaged()).getContent();
        } else {
            pendingReports = wasteReportRepository.findByStatusIn(List.of("PENDING"));
        }

        List<SuggestedReportDTO> scoredReports = new ArrayList<>();
        for (WasteReport report : pendingReports) {
            Double score = calculatePriorityScoreInternal(report);
            String reason = getPriorityReason(report, score);

            scoredReports.add(SuggestedReportDTO.builder()
                    .reportId(report.getId())
                    .citizenName(report.getCitizen().getUser() != null
                            ? report.getCitizen().getUser().getFullName()
                            : "Unknown")
                    .areaName(report.getArea() != null ? report.getArea().getName() : null)
                    .wasteTypeName(report.getPrimaryWasteType() != null
                            ? report.getPrimaryWasteType().getName()
                            : null)
                    .estimatedWeightKg(report.getEstimatedWeightKg())
                    .locationText(report.getLocationText())
                    .priority(report.getPriority())
                    .status(report.getStatus())
                    .priorityScore(score)
                    .priorityReason(reason)
                    .createdAt(report.getCreatedAt() != null
                            ? report.getCreatedAt().toString()
                            : null)
                    .build());
        }

        return scoredReports.stream()
                .sorted(Comparator.comparingDouble(SuggestedReportDTO::getPriorityScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculatePriorityScore(UUID reportId) {
        WasteReport report = findById(reportId);
        return calculatePriorityScoreInternal(report);
    }

    private Double calculatePriorityScoreInternal(WasteReport report) {
        double score = 0.0;

        // 1. Weight factor (normalized to 0-100 scale, max 50kg = 100)
        double weightScore = Math.min((report.getEstimatedWeightKg() / 50.0) * 100, 100);
        score += weightScore * WEIGHT_FACTOR;

        // 2. Priority factor
        double priorityScore = switch (report.getPriority() != null ? report.getPriority() : "NORMAL") {
            case "URGENT" -> 100;
            case "HIGH" -> 75;
            case "NORMAL" -> 50;
            case "LOW" -> 25;
            default -> 50;
        };
        score += priorityScore * PRIORITY_FACTOR;

        // 3. Age factor (older = higher priority, max 7 days = 100)
        if (report.getCreatedAt() != null) {
            long hoursSinceCreation = ChronoUnit.HOURS.between(report.getCreatedAt(), LocalDateTime.now());
            double ageScore = Math.min((hoursSinceCreation / 168.0) * 100, 100); // 168 hours = 7 days
            score += ageScore * AGE_FACTOR;
        }

        // 4. Waste type factor (based on base points per kg)
        if (report.getPrimaryWasteType() != null && report.getPrimaryWasteType().getBasePointsPerKg() != null) {
            double wasteTypeScore = Math.min(report.getPrimaryWasteType().getBasePointsPerKg() * 5, 100);
            score += wasteTypeScore * WASTE_TYPE_FACTOR;
        }

        return Math.round(score * 100.0) / 100.0;
    }

    private String getPriorityReason(WasteReport report, Double score) {
        List<String> reasons = new ArrayList<>();

        if (report.getEstimatedWeightKg() > 30) {
            reasons.add("Khối lượng lớn");
        }
        if ("URGENT".equals(report.getPriority()) || "HIGH".equals(report.getPriority())) {
            reasons.add("Ưu tiên cao từ người dùng");
        }
        if (report.getCreatedAt() != null) {
            long hours = ChronoUnit.HOURS.between(report.getCreatedAt(), LocalDateTime.now());
            if (hours > 48) {
                reasons.add("Chờ xử lý > 48h");
            }
        }
        if (report.getPrimaryWasteType() != null &&
                report.getPrimaryWasteType().getBasePointsPerKg() != null &&
                report.getPrimaryWasteType().getBasePointsPerKg() > 15) {
            reasons.add("Loại rác có giá trị cao");
        }

        return reasons.isEmpty() ? "Tiêu chuẩn" : String.join(", ", reasons);
    }

    private WasteReport findById(UUID id) {
        return wasteReportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WasteReport not found with id: " + id));
    }

    private WasteReportResponse mapToResponse(WasteReport report) {
        return WasteReportResponse.builder()
                .id(report.getId())
                .citizenId(report.getCitizen().getId())
                .citizenName(report.getCitizen().getUser() != null ? report.getCitizen().getUser().getFullName() : null)
                .areaId(report.getArea() != null ? report.getArea().getId() : null)
                .areaName(report.getArea() != null ? report.getArea().getName() : null)
                .primaryWasteTypeId(report.getPrimaryWasteType() != null ? report.getPrimaryWasteType().getId() : null)
                .primaryWasteTypeName(
                        report.getPrimaryWasteType() != null ? report.getPrimaryWasteType().getName() : null)
                .estimatedWeightKg(report.getEstimatedWeightKg())
                .locationText(report.getLocationText())
                .lat(report.getLat())
                .lng(report.getLng())
                .description(report.getDescription())
                .imageUrls(report.getImageUrls())
                .status(report.getStatus())
                .rejectionReason(report.getRejectionReason())
                .priority(report.getPriority())
                .preferredDate(report.getPreferredDate())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
