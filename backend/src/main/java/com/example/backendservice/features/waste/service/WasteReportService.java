package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.waste.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface WasteReportService {

    // CRUD
    WasteReportResponse createReport(UUID citizenUserId, CreateWasteReportRequest request);

    WasteReportResponse getReportById(UUID reportId);

    Page<WasteReportResponse> getReportsByCitizen(UUID citizenUserId, Pageable pageable);

    Page<WasteReportResponse> getReportsByArea(UUID areaId, Pageable pageable);

    Page<WasteReportResponse> getReportsByStatus(String status, Pageable pageable);

    Page<WasteReportResponse> getAllReports(Pageable pageable);

    // Status management
    WasteReportResponse approveReport(UUID reportId, UUID adminUserId);

    WasteReportResponse rejectReport(UUID reportId, UUID adminUserId, String reason);

    WasteReportResponse assignToTask(UUID reportId, UUID taskId);

    WasteReportResponse markCompleted(UUID reportId);

    // Update
    WasteReportResponse updateReport(UUID reportId, CreateWasteReportRequest request);

    void deleteReport(UUID reportId);
}
