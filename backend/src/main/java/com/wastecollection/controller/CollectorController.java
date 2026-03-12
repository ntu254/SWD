package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.enterprise.KpiConfigDto;
import com.wastecollection.dto.task.*;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.CloudinaryService;
import com.wastecollection.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/collector")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('COLLECTOR', 'ADMIN')")
@Tag(name = "Collector", description = "View and complete collection tasks")
public class CollectorController {

    private final TaskService taskService;
    private final SecurityUtils securityUtils;
    private final CloudinaryService cloudinaryService;

    @GetMapping("/tasks")
    @Operation(summary = "Get assigned tasks for the authenticated collector")
    public ResponseEntity<ApiResponse<PageResponse<TaskDto>>> getMyTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getTasksForCollector(securityUtils.getCurrentUserId(), page, size)));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get a specific task detail")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getTaskForCollector(taskId, securityUtils.getCurrentUserId())));
    }

    @PutMapping("/tasks/{taskId}/status")
    @Operation(summary = "Update task status (ACCEPTED, ON_THE_WAY)")
    public ResponseEntity<ApiResponse<TaskDto>> updateStatus(
            @PathVariable UUID taskId,
            @RequestParam String status) {
        TaskDto dto = taskService.updateAssignmentStatus(taskId, securityUtils.getCurrentUserId(), status);
        return ResponseEntity.ok(ApiResponse.success("Status updated", dto));
    }

    @PostMapping("/tasks/{taskId}/complete")
    @Operation(summary = "Complete a task: submit proof photos, waste items, sorting quality")
    public ResponseEntity<ApiResponse<TaskDto>> completeTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody CompleteVisitRequest request) {
        TaskDto dto = taskService.completeVisit(taskId, securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Task completed", dto));
    }

    @PostMapping("/evidence/upload")
    @Operation(summary = "Upload collector evidence photo")
    public ResponseEntity<ApiResponse<String>> uploadEvidence(@RequestParam("file") MultipartFile file) {
        String url = cloudinaryService.uploadImage(file, "collector-evidence");
        return ResponseEntity.ok(ApiResponse.success("Evidence uploaded", url));
    }

    @GetMapping("/kpi/today")
    @Operation(summary = "View today's KPI progress (visits completed, weight collected vs targets)")
    public ResponseEntity<ApiResponse<KpiConfigDto>> getTodayKpi() {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getTodayKpi(securityUtils.getCurrentUserId())));
    }
}
