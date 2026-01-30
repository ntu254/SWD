package com.example.backendservice.features.analytics.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.analytics.dto.*;
import com.example.backendservice.features.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "APIs báo cáo thống kê doanh nghiệp")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/enterprise/{enterpriseId}")
    @Operation(summary = "Lấy toàn bộ thống kê của doanh nghiệp")
    public ResponseEntity<ApiResponse<EnterpriseAnalyticsResponse>> getEnterpriseAnalytics(
            @PathVariable UUID enterpriseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        EnterpriseAnalyticsResponse response = analyticsService.getEnterpriseAnalytics(
                enterpriseId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/enterprise/{enterpriseId}/summary")
    @Operation(summary = "Lấy tổng quan thống kê")
    public ResponseEntity<ApiResponse<EnterpriseSummaryDTO>> getEnterpriseSummary(
            @PathVariable UUID enterpriseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        EnterpriseSummaryDTO response = analyticsService.getEnterpriseSummary(
                enterpriseId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/enterprise/{enterpriseId}/by-waste-type")
    @Operation(summary = "Thống kê theo loại rác")
    public ResponseEntity<ApiResponse<List<WasteTypeSummaryDTO>>> getWasteTypeBreakdown(
            @PathVariable UUID enterpriseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<WasteTypeSummaryDTO> response = analyticsService.getWasteTypeBreakdown(
                enterpriseId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/enterprise/{enterpriseId}/by-area")
    @Operation(summary = "Thống kê theo khu vực")
    public ResponseEntity<ApiResponse<List<AreaSummaryDTO>>> getAreaBreakdown(
            @PathVariable UUID enterpriseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<AreaSummaryDTO> response = analyticsService.getAreaBreakdown(
                enterpriseId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/enterprise/{enterpriseId}/daily")
    @Operation(summary = "Thống kê theo ngày")
    public ResponseEntity<ApiResponse<List<DailyStatDTO>>> getDailyStats(
            @PathVariable UUID enterpriseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<DailyStatDTO> response = analyticsService.getDailyStats(
                enterpriseId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
