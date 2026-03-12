package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.report.ReportDto;
import com.wastecollection.dto.task.*;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.TaskService;
import com.wastecollection.service.WasteReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/enterprise")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ENTERPRISE', 'ADMIN')")
@Tag(name = "Enterprise", description = "Enterprise task management, pending reports, capabilities")
public class EnterpriseTaskController {

    private final TaskService taskService;
    private final WasteReportService reportService;
    private final SecurityUtils securityUtils;

    @GetMapping("/reports/pending")
    @Operation(summary = "View pending reports in enterprise service areas")
    public ResponseEntity<ApiResponse<PageResponse<ReportDto>>> getPendingReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                reportService.getPendingReportsForEnterprise(securityUtils.getCurrentUserId(), page, size)));
    }

    @PutMapping("/reports/{reportId}/accept")
    @Operation(summary = "Accept a pending report → creates a task")
    public ResponseEntity<ApiResponse<TaskDto>> acceptReport(@PathVariable UUID reportId) {
        TaskDto dto = taskService.acceptReport(reportId, securityUtils.getCurrentUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Report accepted", dto));
    }

    @PutMapping("/reports/{reportId}/reject")
    @Operation(summary = "Reject a pending report")
    public ResponseEntity<ApiResponse<ReportDto>> rejectReport(
            @PathVariable UUID reportId,
            @RequestParam(required = false) String reason) {
        taskService.rejectReport(reportId, securityUtils.getCurrentUserId(), reason);
        return ResponseEntity.ok(ApiResponse.success("Report rejected", null));
    }

    @GetMapping("/tasks")
    @Operation(summary = "List tasks for this enterprise")
    public ResponseEntity<ApiResponse<PageResponse<TaskDto>>> getTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(
                taskService.getTasksForEnterprise(securityUtils.getCurrentUserId(), page, size, status)));
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "Get a task detail")
    public ResponseEntity<ApiResponse<TaskDto>> getTask(@PathVariable UUID taskId) {
        return ResponseEntity.ok(ApiResponse.success(taskService.getTask(taskId)));
    }

    @PostMapping("/tasks/{taskId}/assign")
    @Operation(summary = "Assign a task to a collector")
    public ResponseEntity<ApiResponse<TaskDto>> assignTask(
            @PathVariable UUID taskId,
            @Valid @RequestBody AssignTaskRequest request) {
        TaskDto dto = taskService.assignTask(taskId, securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Task assigned", dto));
    }
}
