package com.example.backendservice.features.waste.controller;

import com.example.backendservice.features.waste.dto.*;
import com.example.backendservice.features.waste.service.WasteReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/waste-reports")
@RequiredArgsConstructor
@Tag(name = "Waste Report", description = "APIs for managing waste reports")
public class WasteReportController {

    private final WasteReportService wasteReportService;

    @PostMapping
    @Operation(summary = "Create a new waste report")
    public ResponseEntity<WasteReportResponse> createReport(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            @Valid @RequestBody CreateWasteReportRequest request) {
        WasteReportResponse response = wasteReportService.createReport(citizenUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Get waste report by ID")
    public ResponseEntity<WasteReportResponse> getReportById(@PathVariable UUID reportId) {
        WasteReportResponse response = wasteReportService.getReportById(reportId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/citizen/{citizenUserId}")
    @Operation(summary = "Get waste reports by citizen ID")
    public ResponseEntity<Page<WasteReportResponse>> getReportsByCitizen(
            @PathVariable UUID citizenUserId,
            Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get my waste reports")
    public ResponseEntity<Page<WasteReportResponse>> getMyReports(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Get waste reports by area ID")
    public ResponseEntity<Page<WasteReportResponse>> getReportsByArea(
            @PathVariable UUID areaId,
            Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByArea(areaId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get waste reports by status")
    public ResponseEntity<Page<WasteReportResponse>> getReportsByStatus(
            @PathVariable String status,
            Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getReportsByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all waste reports with pagination")
    public ResponseEntity<Page<WasteReportResponse>> getAllReports(Pageable pageable) {
        Page<WasteReportResponse> response = wasteReportService.getAllReports(pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{reportId}/approve")
    @Operation(summary = "Approve waste report")
    public ResponseEntity<WasteReportResponse> approveReport(
            @PathVariable UUID reportId,
            @RequestHeader("X-User-Id") UUID adminUserId) {
        WasteReportResponse response = wasteReportService.approveReport(reportId, adminUserId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{reportId}/reject")
    @Operation(summary = "Reject waste report")
    public ResponseEntity<WasteReportResponse> rejectReport(
            @PathVariable UUID reportId,
            @RequestHeader("X-User-Id") UUID adminUserId,
            @RequestParam String reason) {
        WasteReportResponse response = wasteReportService.rejectReport(reportId, adminUserId, reason);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reportId}")
    @Operation(summary = "Update waste report")
    public ResponseEntity<WasteReportResponse> updateReport(
            @PathVariable UUID reportId,
            @Valid @RequestBody CreateWasteReportRequest request) {
        WasteReportResponse response = wasteReportService.updateReport(reportId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reportId}")
    @Operation(summary = "Delete waste report")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID reportId) {
        wasteReportService.deleteReport(reportId);
        return ResponseEntity.noContent().build();
    }
}
