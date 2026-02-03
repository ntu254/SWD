package com.example.backendservice.features.waste.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.dto.*;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WasteReportServiceImpl implements WasteReportService {

    private final WasteReportRepository wasteReportRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;

    @Override
    @Transactional
    public WasteReportResponse createReport(UUID reporterUserId, CreateWasteReportRequest request) {
        User reporterUser = userRepository.findByUserId(reporterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reporterUserId));

        ServiceArea area = serviceAreaRepository.findByAreaId(request.getAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + request.getAreaId()));

        WasteReport report = WasteReport.builder()
                .reporterUser(reporterUser)
                .area(area)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .description(request.getNoteText())
                .reportPhotoUrl(request.getPhotoUrl())
                .status("PENDING")
                .build();

        report = wasteReportRepository.save(report);
        log.info("Created waste report {} by user {}", report.getReportId(), reporterUserId);

        return toResponse(report);
    }

    @Override
    public WasteReportResponse getReportById(UUID reportId) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));
        return toResponse(report);
    }

    @Override
    public Page<WasteReportResponse> getReportsByCitizen(UUID citizenUserId, Pageable pageable) {
        List<WasteReport> reports = wasteReportRepository.findByReporterUserId(citizenUserId);
        List<WasteReportResponse> responses = reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<WasteReportResponse> pagedList = start < responses.size()
                ? responses.subList(start, end)
                : List.of();

        return new PageImpl<>(pagedList, pageable, responses.size());
    }

    @Override
    public Page<WasteReportResponse> getReportsByArea(UUID areaId, Pageable pageable) {
        List<WasteReport> reports = wasteReportRepository.findByAreaId(areaId);
        List<WasteReportResponse> responses = reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<WasteReportResponse> pagedList = start < responses.size()
                ? responses.subList(start, end)
                : List.of();

        return new PageImpl<>(pagedList, pageable, responses.size());
    }

    @Override
    public Page<WasteReportResponse> getReportsByStatus(String status, Pageable pageable) {
        List<WasteReport> reports = wasteReportRepository.findByStatus(status);
        List<WasteReportResponse> responses = reports.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<WasteReportResponse> pagedList = start < responses.size()
                ? responses.subList(start, end)
                : List.of();

        return new PageImpl<>(pagedList, pageable, responses.size());
    }

    @Override
    public Page<WasteReportResponse> getAllReports(Pageable pageable) {
        return wasteReportRepository.findAll(pageable).map(this::toResponse);
    }

    @Override
    @Transactional
    public WasteReportResponse approveReport(UUID reportId, UUID adminUserId) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Report is not in PENDING status");
        }

        report.setStatus("APPROVED");
        report = wasteReportRepository.save(report);
        log.info("Report {} approved by admin {}", reportId, adminUserId);

        return toResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse rejectReport(UUID reportId, UUID adminUserId, String reason) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Report is not in PENDING status");
        }

        report.setStatus("REJECTED");
        // Note: Description field can store the rejection reason
        if (reason != null && !reason.isEmpty()) {
            report.setDescription("REJECTED: " + reason);
        }
        report = wasteReportRepository.save(report);
        log.info("Report {} rejected by admin {} with reason: {}", reportId, adminUserId, reason);

        return toResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse assignToTask(UUID reportId, UUID taskId) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        report.setStatus("ASSIGNED");
        report = wasteReportRepository.save(report);
        log.info("Report {} assigned to task {}", reportId, taskId);

        return toResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse markCompleted(UUID reportId) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        report.setStatus("COMPLETED");
        report = wasteReportRepository.save(report);
        log.info("Report {} marked as completed", reportId);

        return toResponse(report);
    }

    @Override
    @Transactional
    public WasteReportResponse updateReport(UUID reportId, CreateWasteReportRequest request) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Can only update reports in PENDING status");
        }

        if (request.getAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findByAreaId(request.getAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + request.getAreaId()));
            report.setArea(area);
        }
        if (request.getLatitude() != null) {
            report.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            report.setLongitude(request.getLongitude());
        }
        if (request.getNoteText() != null) {
            report.setDescription(request.getNoteText());
        }
        if (request.getPhotoUrl() != null) {
            report.setReportPhotoUrl(request.getPhotoUrl());
        }

        report = wasteReportRepository.save(report);
        log.info("Updated waste report {}", reportId);

        return toResponse(report);
    }

    @Override
    @Transactional
    public void deleteReport(UUID reportId) {
        WasteReport report = wasteReportRepository.findByReportId(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + reportId));

        if (!"PENDING".equals(report.getStatus())) {
            throw new IllegalStateException("Can only delete reports in PENDING status");
        }

        wasteReportRepository.delete(report);
        log.info("Deleted waste report {}", reportId);
    }

    private WasteReportResponse toResponse(WasteReport report) {
        return WasteReportResponse.builder()
                .reportId(report.getReportId())
                .citizenUserId(report.getReporterUserId())
                .citizenName(report.getReporterUser() != null ? report.getReporterUser().getFullName() : null)
                .areaId(report.getArea() != null ? report.getArea().getAreaId() : null)
                .areaName(report.getArea() != null ? report.getArea().getName() : null)
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .noteText(report.getDescription())
                .photoUrl(report.getReportPhotoUrl())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
