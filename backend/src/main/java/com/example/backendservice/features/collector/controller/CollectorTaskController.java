package com.example.backendservice.features.collector.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.collector.dto.*;
import com.example.backendservice.features.collector.service.CollectorTaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collector")
@RequiredArgsConstructor
@Tag(name = "Collector Task Management", description = "APIs for collectors to manage their assigned tasks")
public class CollectorTaskController {

    private final CollectorTaskService collectorTaskService;

    // ===================== TASK VIEWING =====================

    @Operation(summary = "View assigned tasks", description = "Collector views their currently assigned and on-the-way tasks")
    @GetMapping("/{collectorId}/tasks")
    public ResponseEntity<ApiResponse<PageResponse<CollectorTaskResponse>>> viewAssignedTasks(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CollectorTaskResponse> result = collectorTaskService.viewAssignedTasks(collectorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    // ===================== TASK ACTIONS =====================

    @Operation(summary = "Accept an assigned task", description = "Collector accepts an assigned task, transitioning it from ASSIGNED to ON_THE_WAY")
    @PatchMapping("/{collectorId}/tasks/{taskId}/accept")
    public ResponseEntity<ApiResponse<AcceptTaskResponse>> acceptTask(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId) {

        AcceptTaskResponse response = collectorTaskService.acceptTask(taskId, collectorId);
        return ResponseEntity.ok(ApiResponse.success("Task accepted successfully", response));
    }

    @Operation(summary = "Update task status", description = "Collector updates task status. Allowed transitions from ON_THE_WAY: COLLECTED, FAILED, CANCELLED")
    @PatchMapping("/{collectorId}/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<CollectorTaskResponse>> updateTaskStatus(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        CollectorTaskResponse response = collectorTaskService.updateTaskStatus(taskId, collectorId, request);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    @Operation(summary = "Upload proof image", description = "Collector uploads proof image for a completed (COLLECTED) task")
    @PostMapping("/{collectorId}/tasks/{taskId}/proof")
    public ResponseEntity<ApiResponse<CollectorTaskResponse>> uploadProof(
            @Parameter(description = "Task ID") @PathVariable UUID taskId,
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Valid @RequestBody UploadProofRequest request) {

        CollectorTaskResponse response = collectorTaskService.uploadProof(taskId, collectorId, request);
        return ResponseEntity.ok(ApiResponse.success("Proof uploaded successfully", response));
    }

    // ===================== HISTORY & PERFORMANCE =====================

    @Operation(summary = "Get job history", description = "Collector views their completed, failed, and cancelled job history")
    @GetMapping("/{collectorId}/history")
    public ResponseEntity<ApiResponse<PageResponse<JobHistoryResponse>>> getJobHistory(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId,
            @Parameter(description = "Filter from date (ISO instant)") @RequestParam(required = false) Instant from,
            @Parameter(description = "Filter to date (ISO instant)") @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<JobHistoryResponse> result = collectorTaskService.getJobHistory(collectorId, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(result)));
    }

    @Operation(summary = "Get performance summary", description = "Collector views their performance metrics (completion rate, totals)")
    @GetMapping("/{collectorId}/performance")
    public ResponseEntity<ApiResponse<PerformanceSummaryResponse>> getPerformanceSummary(
            @Parameter(description = "Collector user ID") @PathVariable UUID collectorId) {

        PerformanceSummaryResponse response = collectorTaskService.getPerformanceSummary(collectorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
