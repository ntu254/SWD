package com.example.backendservice.features.analytics.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.analytics.dto.GlobalAnalyticsResponse;
import com.example.backendservice.features.analytics.dto.GlobalSummaryDTO;
import com.example.backendservice.features.analytics.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
@Tag(name = "Global Analytics", description = "APIs for system-wide analytics for administrators")
public class GlobalAnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(summary = "Get global analytics dashboard", description = "Get system-wide summary and breakdowns")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GlobalAnalyticsResponse>> getGlobalAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        GlobalAnalyticsResponse response = analyticsService.getGlobalAnalytics(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get global summary stats", description = "Get high-level system metrics")
    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<GlobalSummaryDTO>> getGlobalSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        GlobalSummaryDTO response = analyticsService.getGlobalSummary(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
