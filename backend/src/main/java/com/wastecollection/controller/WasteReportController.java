package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.report.CreateReportRequest;
import com.wastecollection.dto.report.ReportDto;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.WasteReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Waste Reports", description = "Create and track waste collection reports")
public class WasteReportController {

    private final WasteReportService reportService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Create a new waste report (CITIZEN)")
    public ResponseEntity<ApiResponse<ReportDto>> createReport(@Valid @RequestBody CreateReportRequest request) {
        ReportDto dto = reportService.createReport(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Report created", dto));
    }

    @GetMapping("/mine")
    @Operation(summary = "Get own reports (CITIZEN)")
    public ResponseEntity<ApiResponse<PageResponse<ReportDto>>> getMyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getMyReports(securityUtils.getCurrentUserId(), page, size)));
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Get a specific report by ID")
    public ResponseEntity<ApiResponse<ReportDto>> getReport(@PathVariable UUID reportId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReport(reportId)));
    }

    @PutMapping("/{reportId}/cancel")
    @Operation(summary = "Cancel a PENDING report (CITIZEN)")
    public ResponseEntity<ApiResponse<ReportDto>> cancelReport(@PathVariable UUID reportId) {
        ReportDto dto = reportService.cancelReport(reportId, securityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success("Report cancelled", dto));
    }

    @GetMapping
    @Operation(summary = "List all reports (ADMIN, ENTERPRISE)")
    public ResponseEntity<ApiResponse<PageResponse<ReportDto>>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAllReports(page, size, status)));
    }
}
