package com.example.backendservice.features.collector.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.collector.dto.CollectorKpiDailyResponse;
import com.example.backendservice.features.collector.service.CollectorKpiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collector")
@RequiredArgsConstructor
@Tag(name = "Collector KPI Management", description = "APIs for managing collector KPI metrics and targets")
public class CollectorKpiController {

    private final CollectorKpiService collectorKpiService;

    // ===================== COLLECTOR KPI ENDPOINTS =====================

    @Operation(summary = "Get daily KPI", description = "Get KPI data for a collector on a specific date")
    @GetMapping("/{collectorId}/kpi/daily")
    public ResponseEntity<ApiResponse<CollectorKpiDailyResponse>> getKpiByDate(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Parameter(description = "KPI date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        CollectorKpiDailyResponse response = collectorKpiService.getKpiByCollectorAndDate(collectorId, date);
        if (response == null) {
            return ResponseEntity.ok(ApiResponse.success("No KPI data found for this date", null));
        }
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get KPI history", description = "Get KPI data for a collector within a date range")
    @GetMapping("/{collectorId}/kpi/history")
    public ResponseEntity<ApiResponse<List<CollectorKpiDailyResponse>>> getKpiHistory(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Parameter(description = "Start date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<CollectorKpiDailyResponse> responses = collectorKpiService.getKpisByCollector(collectorId, startDate,
                endDate);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    // ===================== ADMIN KPI ENDPOINTS =====================

    @Operation(summary = "Set KPI targets", description = "Admin sets KPI targets (min weight, min visits) for a collector in a specific area and date")
    @PostMapping("/{collectorId}/kpi/targets")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE')")
    public ResponseEntity<ApiResponse<CollectorKpiDailyResponse>> setKpiTargets(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Parameter(description = "Service area ID") @RequestParam UUID areaId,
            @Parameter(description = "KPI date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @Parameter(description = "Minimum weight in kg") @RequestParam Double minWeightKg,
            @Parameter(description = "Minimum number of visits") @RequestParam Integer minVisits) {

        CollectorKpiDailyResponse response = collectorKpiService.setKpiTargets(collectorId, areaId, date, minWeightKg,
                minVisits);
        return ResponseEntity.ok(ApiResponse.success("KPI targets set successfully", response));
    }

    @Operation(summary = "Get area KPI summary", description = "Admin views KPI data for all collectors in a specific area on a given date")
    @GetMapping("/kpi/area/{areaId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE')")
    public ResponseEntity<ApiResponse<List<CollectorKpiDailyResponse>>> getKpisByArea(
            @Parameter(description = "Service area ID") @PathVariable UUID areaId,
            @Parameter(description = "KPI date (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        List<CollectorKpiDailyResponse> responses = collectorKpiService.getKpisByArea(areaId, date);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @Operation(summary = "Finalize daily KPIs", description = "Admin finalizes all pending KPIs for a specific date, marking them as MET or NOT_MET")
    @PostMapping("/kpi/finalize")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE')")
    public ResponseEntity<ApiResponse<Void>> finalizeKpis(
            @Parameter(description = "Date to finalize (yyyy-MM-dd)") @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        collectorKpiService.finalizeKpisForDate(date);
        return ResponseEntity.ok(ApiResponse.success("KPIs finalized successfully for " + date, null));
    }
}
