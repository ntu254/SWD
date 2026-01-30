package com.example.backendservice.features.waste.service;

import com.example.backendservice.features.waste.dto.CreateWasteReportRequest;
import com.example.backendservice.features.waste.dto.SuggestedReportDTO;
import com.example.backendservice.features.waste.dto.WasteReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface WasteReportService {

    WasteReportResponse createReport(CreateWasteReportRequest request);

    WasteReportResponse getReportById(UUID id);

    Page<WasteReportResponse> getReportsByCitizen(UUID citizenId, Pageable pageable);

    Page<WasteReportResponse> getReportsByArea(UUID areaId, String status, Pageable pageable);

    Page<WasteReportResponse> getPendingReports(Pageable pageable);

    WasteReportResponse updateReport(UUID id, CreateWasteReportRequest request);

    // Status Flow
    WasteReportResponse acceptReport(UUID id);

    WasteReportResponse rejectReport(UUID id, String reason);

    WasteReportResponse cancelReport(UUID id);

    // Priority Scoring
    List<SuggestedReportDTO> getSuggestedReports(UUID enterpriseId, UUID areaId, int limit);

    Double calculatePriorityScore(UUID reportId);
}
