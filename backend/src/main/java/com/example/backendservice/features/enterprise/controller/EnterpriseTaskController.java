package com.example.backendservice.features.enterprise.controller;

import com.example.backendservice.features.task.dto.TaskResponse;
import com.example.backendservice.features.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Controller for Enterprise task management
 * Provides endpoints for enterprises to accept/reject tasks
 */
@RestController
@RequestMapping("/api/v1/enterprises/tasks")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Enterprise Tasks", description = "Enterprise task approval and management")
public class EnterpriseTaskController {

    private final TaskService taskService;

    @GetMapping("/pending-approval")
    @PreAuthorize("hasRole('ENTERPRISE')")
    @Operation(summary = "Get tasks pending enterprise approval")
    public ResponseEntity<Page<TaskResponse>> getPendingApprovalTasks(
            @Parameter(description = "Enterprise user ID") @RequestParam UUID enterpriseId,
            Pageable pageable) {
        log.info("Getting pending approval tasks for enterprise: {}", enterpriseId);
        Page<TaskResponse> tasks = taskService.getPendingApprovalTasksByEnterprise(enterpriseId, pageable);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/{taskId}/accept")
    @PreAuthorize("hasRole('ENTERPRISE')")
    @Operation(summary = "Accept a task")
    public ResponseEntity<TaskResponse> acceptTask(
            @PathVariable UUID taskId,
            @Parameter(description = "Enterprise user ID") @RequestParam UUID enterpriseId) {
        log.info("Enterprise {} accepting task {}", enterpriseId, taskId);
        TaskResponse task = taskService.acceptTaskByEnterprise(taskId, enterpriseId);
        return ResponseEntity.ok(task);
    }

    @PostMapping("/{taskId}/reject")
    @PreAuthorize("hasRole('ENTERPRISE')")
    @Operation(summary = "Reject a task")
    public ResponseEntity<TaskResponse> rejectTask(
            @PathVariable UUID taskId,
            @Parameter(description = "Enterprise user ID") @RequestParam UUID enterpriseId,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        log.info("Enterprise {} rejecting task {} with reason: {}", enterpriseId, taskId, reason);
        TaskResponse task = taskService.rejectTaskByEnterprise(taskId, enterpriseId, reason);
        return ResponseEntity.ok(task);
    }
}
