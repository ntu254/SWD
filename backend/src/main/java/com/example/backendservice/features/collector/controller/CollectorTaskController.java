package com.example.backendservice.features.collector.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.collector.dto.*;
import com.example.backendservice.features.collector.service.CollectorTaskService;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collector")
@RequiredArgsConstructor
@Tag(name = "Collector Task Management", description = "APIs for collectors to manage their collection tasks")
public class CollectorTaskController {

    private final CollectorTaskService collectorTaskService;
    private final UserRepository userRepository;

    // ==================== TASK MANAGEMENT ====================

    @Operation(summary = "View assigned tasks", description = "Collector views tasks currently assigned to them (ASSIGNED, ON_THE_WAY)")
    @GetMapping("/tasks")
    public ResponseEntity<ApiResponse<PageResponse<CollectorTaskResponse>>> viewAssignedTasks(
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "assignedAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        UUID collectorId = getCurrentUserId();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<CollectorTaskResponse> tasks = collectorTaskService.viewAssignedTasks(collectorId, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(tasks)));
    }

    @Operation(summary = "Accept a task", description = "Collector accepts an assigned task. Transitions status from ASSIGNED to ON_THE_WAY")
    @PostMapping("/tasks/{taskId}/accept")
    public ResponseEntity<ApiResponse<AcceptTaskResponse>> acceptTask(
            @Parameter(description = "ID of the task to accept") @PathVariable UUID taskId) {

        UUID collectorId = getCurrentUserId();
        AcceptTaskResponse response = collectorTaskService.acceptTask(taskId, collectorId);
        return ResponseEntity.ok(ApiResponse.success("Task accepted successfully", response));
    }

    @Operation(summary = "Update task status", description = "Collector updates task status. Allowed transitions from ON_THE_WAY: COLLECTED, FAILED, CANCELLED")
    @PostMapping("/tasks/{taskId}/status")
    public ResponseEntity<ApiResponse<CollectorTaskResponse>> updateTaskStatus(
            @Parameter(description = "ID of the task") @PathVariable UUID taskId,
            @Valid @RequestBody UpdateTaskStatusRequest request) {

        UUID collectorId = getCurrentUserId();
        CollectorTaskResponse response = collectorTaskService.updateTaskStatus(taskId, collectorId, request);
        return ResponseEntity.ok(ApiResponse.success("Task status updated successfully", response));
    }

    @Operation(summary = "Upload proof image", description = "Collector uploads proof image after completing collection. Only allowed when status is COLLECTED")
    @PostMapping("/tasks/{taskId}/proof")
    public ResponseEntity<ApiResponse<CollectorTaskResponse>> uploadProof(
            @Parameter(description = "ID of the task") @PathVariable UUID taskId,
            @Valid @RequestBody UploadProofRequest request) {

        UUID collectorId = getCurrentUserId();
        CollectorTaskResponse response = collectorTaskService.uploadProof(taskId, collectorId, request);
        return ResponseEntity.ok(ApiResponse.success("Proof uploaded successfully", response));
    }

    // ==================== JOB HISTORY ====================

    @Operation(summary = "View job history", description = "Collector views completed, failed, or cancelled jobs with optional date filtering")
    @GetMapping("/jobs/history")
    public ResponseEntity<ApiResponse<PageResponse<JobHistoryResponse>>> getJobHistory(
            @Parameter(description = "Filter from date (ISO-8601)") @RequestParam(required = false) Instant from,
            @Parameter(description = "Filter to date (ISO-8601)") @RequestParam(required = false) Instant to,
            @Parameter(description = "Page number") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort by field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction") @RequestParam(defaultValue = "desc") String sortDir) {

        UUID collectorId = getCurrentUserId();
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<JobHistoryResponse> jobs = collectorTaskService.getJobHistory(collectorId, from, to, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(jobs)));
    }

    // ==================== PERFORMANCE ====================

    @Operation(summary = "Get performance summary", description = "Collector views their performance metrics including completion rate and average completion time")
    @GetMapping("/performance/summary")
    public ResponseEntity<ApiResponse<PerformanceSummaryResponse>> getPerformanceSummary() {

        UUID collectorId = getCurrentUserId();
        PerformanceSummaryResponse response = collectorTaskService.getPerformanceSummary(collectorId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== PRIVATE HELPERS ====================

    private UUID getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserDetails userDetails) {
            String email = userDetails.getUsername();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalStateException("User not found: " + email));
            return user.getId();
        }
        throw new IllegalStateException("Unable to determine current user");
    }
}
