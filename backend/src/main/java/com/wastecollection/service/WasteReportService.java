package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.report.CreateReportRequest;
import com.wastecollection.dto.report.ReportDto;
import com.wastecollection.entity.*;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ForbiddenException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WasteReportService {

    private final WasteReportRepository reportRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final UserRepository userRepository;

    @Transactional
    public ReportDto createReport(UUID citizenId, CreateReportRequest request) {
        User citizen = userRepository.findById(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", citizenId));

        WasteReport report = WasteReport.builder()
                .reporter(citizen)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .gpsAccuracyMeters(request.getGpsAccuracyMeters())
                .description(request.getDescription())
                .reportPhotoUrl(request.getReportPhotoUrl())
                .requestedPickupTime(request.getRequestedPickupTime())
                .status("PENDING")
                .build();

        if (request.getWasteTypeId() != null) {
            WasteType wasteType = wasteTypeRepository.findById(request.getWasteTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", request.getWasteTypeId()));
            report.setWasteType(wasteType);
        }

        if (request.getAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", request.getAreaId()));
            report.setArea(area);
        }

        return mapToDto(reportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public ReportDto getReport(UUID reportId) {
        return mapToDto(reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", reportId)));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportDto> getMyReports(UUID citizenId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<WasteReport> reports = reportRepository.findByReporter_UserId(citizenId, pageable);
        return toPageResponse(reports);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportDto> getAllReports(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<WasteReport> reports = status != null
                ? reportRepository.findByStatus(status, pageable)
                : reportRepository.findAll(pageable);
        return toPageResponse(reports);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportDto> getPendingReportsForEnterprise(UUID enterpriseId, int page, int size) {
        // Enterprise sees PENDING reports in their service areas
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // For now, return all PENDING — area filtering done via area_id check in query
        Page<WasteReport> reports = reportRepository.findByStatus("PENDING", pageable);
        return toPageResponse(reports);
    }

    @Transactional
    public ReportDto cancelReport(UUID reportId, UUID citizenId) {
        WasteReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", reportId));

        if (!report.getReporter().getUserId().equals(citizenId)) {
            throw new ForbiddenException("You can only cancel your own reports");
        }
        if (!"PENDING".equals(report.getStatus())) {
            throw new BadRequestException("Only PENDING reports can be cancelled");
        }

        report.setStatus("CANCELLED");
        return mapToDto(reportRepository.save(report));
    }

    @Transactional
    public ReportDto updateStatus(UUID reportId, String newStatus) {
        WasteReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", reportId));
        report.setStatus(newStatus);
        return mapToDto(reportRepository.save(report));
    }

    public ReportDto mapToDto(WasteReport r) {
        return ReportDto.builder()
                .reportId(r.getReportId())
                .reporterUserId(r.getReporter().getUserId())
                .reporterName(r.getReporter().getDisplayName())
                .wasteTypeId(r.getWasteType() != null ? r.getWasteType().getWasteTypeId() : null)
                .wasteTypeName(r.getWasteType() != null ? r.getWasteType().getName() : null)
                .areaId(r.getArea() != null ? r.getArea().getAreaId() : null)
                .areaName(r.getArea() != null ? r.getArea().getName() : null)
                .latitude(r.getLatitude())
                .longitude(r.getLongitude())
                .gpsAccuracyMeters(r.getGpsAccuracyMeters())
                .description(r.getDescription())
                .reportPhotoUrl(r.getReportPhotoUrl())
                .status(r.getStatus())
                .requestedPickupTime(r.getRequestedPickupTime())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private PageResponse<ReportDto> toPageResponse(Page<WasteReport> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
