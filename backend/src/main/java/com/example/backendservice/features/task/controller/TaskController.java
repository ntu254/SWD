package com.example.backendservice.features.task.controller;

import com.example.backendservice.features.task.dto.*;
import com.example.backendservice.features.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management", description = "APIs for managing collection tasks")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{taskId}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskResponse> getTaskById(@PathVariable UUID taskId) {
        TaskResponse response = taskService.getTaskById(taskId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Get tasks by area")
    public ResponseEntity<Page<TaskResponse>> getTasksByArea(
            @PathVariable UUID areaId,
            Pageable pageable) {
        Page<TaskResponse> response = taskService.getTasksByArea(areaId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get tasks by status")
    public ResponseEntity<Page<TaskResponse>> getTasksByStatus(
            @PathVariable String status,
            Pageable pageable) {
        Page<TaskResponse> response = taskService.getTasksByStatus(status, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get tasks by scheduled date")
    public ResponseEntity<Page<TaskResponse>> getTasksByScheduledDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Pageable pageable) {
        Page<TaskResponse> response = taskService.getTasksByScheduledDate(date, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all tasks")
    public ResponseEntity<Page<TaskResponse>> getAllTasks(Pageable pageable) {
        Page<TaskResponse> response = taskService.getAllTasks(pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{taskId}/status")
    @Operation(summary = "Update task status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable UUID taskId,
            @RequestParam String status) {
        TaskResponse response = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{taskId}")
    @Operation(summary = "Cancel task")
    public ResponseEntity<Void> cancelTask(@PathVariable UUID taskId) {
        taskService.cancelTask(taskId);
        return ResponseEntity.noContent().build();
    }

    // Assignment endpoints
    @PostMapping("/assignments")
    @Operation(summary = "Assign task to collector")
    public ResponseEntity<TaskAssignmentResponse> assignTask(@Valid @RequestBody AssignTaskRequest request) {
        TaskAssignmentResponse response = taskService.assignTask(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/assignments/{assignmentId}")
    @Operation(summary = "Get assignment by ID")
    public ResponseEntity<TaskAssignmentResponse> getAssignmentById(@PathVariable UUID assignmentId) {
        TaskAssignmentResponse response = taskService.getAssignmentById(assignmentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{taskId}/assignments")
    @Operation(summary = "Get assignments for a task")
    public ResponseEntity<List<TaskAssignmentResponse>> getAssignmentsByTask(@PathVariable UUID taskId) {
        List<TaskAssignmentResponse> response = taskService.getAssignmentsByTask(taskId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assignments/collector/{collectorUserId}")
    @Operation(summary = "Get assignments by collector")
    public ResponseEntity<Page<TaskAssignmentResponse>> getAssignmentsByCollector(
            @PathVariable UUID collectorUserId,
            Pageable pageable) {
        Page<TaskAssignmentResponse> response = taskService.getAssignmentsByCollector(collectorUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assignments/collector/{collectorUserId}/pending")
    @Operation(summary = "Get pending assignments for collector")
    public ResponseEntity<Page<TaskAssignmentResponse>> getPendingAssignmentsByCollector(
            @PathVariable UUID collectorUserId,
            Pageable pageable) {
        Page<TaskAssignmentResponse> response = taskService.getPendingAssignmentsByCollector(collectorUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/assignments/{assignmentId}/accept")
    @Operation(summary = "Accept assignment")
    public ResponseEntity<TaskAssignmentResponse> acceptAssignment(@PathVariable UUID assignmentId) {
        TaskAssignmentResponse response = taskService.acceptAssignment(assignmentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/assignments/{assignmentId}/reject")
    @Operation(summary = "Reject assignment")
    public ResponseEntity<TaskAssignmentResponse> rejectAssignment(@PathVariable UUID assignmentId) {
        TaskAssignmentResponse response = taskService.rejectAssignment(assignmentId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/assignments/{assignmentId}/complete")
    @Operation(summary = "Complete assignment")
    public ResponseEntity<TaskAssignmentResponse> completeAssignment(@PathVariable UUID assignmentId) {
        TaskAssignmentResponse response = taskService.completeAssignment(assignmentId);
        return ResponseEntity.ok(response);
    }
}
