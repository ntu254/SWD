package com.example.backendservice.features.task.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.task.dto.*;
import com.example.backendservice.features.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "APIs for managing collection tasks")
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    @Operation(summary = "Tạo nhiệm vụ mới")
    public ResponseEntity<ApiResponse<TaskResponse>> createTask(
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.createTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo nhiệm vụ thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin nhiệm vụ theo ID")
    public ResponseEntity<ApiResponse<TaskResponse>> getTaskById(@PathVariable UUID id) {
        TaskResponse response = taskService.getTaskById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/enterprise/{enterpriseId}")
    @Operation(summary = "Lấy danh sách nhiệm vụ của doanh nghiệp")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getTasksByEnterprise(
            @PathVariable UUID enterpriseId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<TaskResponse> response = taskService.getTasksByEnterprise(enterpriseId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/area/{areaId}")
    @Operation(summary = "Lấy danh sách nhiệm vụ theo khu vực")
    public ResponseEntity<ApiResponse<Page<TaskResponse>>> getTasksByArea(
            @PathVariable UUID areaId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<TaskResponse> response = taskService.getTasksByArea(areaId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> updateTask(
            @PathVariable UUID id,
            @Valid @RequestBody CreateTaskRequest request) {
        TaskResponse response = taskService.updateTask(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Hủy nhiệm vụ")
    public ResponseEntity<ApiResponse<Void>> deleteTask(@PathVariable UUID id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy nhiệm vụ", null));
    }

    // Status Flow
    @PatchMapping("/{id}/start")
    @Operation(summary = "Bắt đầu nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> startTask(@PathVariable UUID id) {
        TaskResponse response = taskService.startTask(id);
        return ResponseEntity.ok(ApiResponse.success("Đã bắt đầu nhiệm vụ", response));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Hoàn thành nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> completeTask(
            @PathVariable UUID id,
            @RequestParam Double actualWeightKg) {
        TaskResponse response = taskService.completeTask(id, actualWeightKg);
        return ResponseEntity.ok(ApiResponse.success("Nhiệm vụ hoàn thành", response));
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Hủy nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskResponse>> cancelTask(
            @PathVariable UUID id,
            @RequestParam String reason) {
        TaskResponse response = taskService.cancelTask(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã hủy nhiệm vụ", response));
    }

    // Assignment
    @PostMapping("/assign")
    @Operation(summary = "Gán nhiệm vụ cho Collector")
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> assignTask(
            @Valid @RequestBody AssignTaskRequest request) {
        TaskAssignmentResponse response = taskService.assignTask(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã gán nhiệm vụ", response));
    }

    @PatchMapping("/assignments/{assignmentId}/accept")
    @Operation(summary = "Collector chấp nhận nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> acceptAssignment(
            @PathVariable UUID assignmentId) {
        TaskAssignmentResponse response = taskService.acceptAssignment(assignmentId);
        return ResponseEntity.ok(ApiResponse.success("Đã chấp nhận nhiệm vụ", response));
    }

    @PatchMapping("/assignments/{assignmentId}/reject")
    @Operation(summary = "Collector từ chối nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> rejectAssignment(
            @PathVariable UUID assignmentId,
            @RequestParam String reason) {
        TaskAssignmentResponse response = taskService.rejectAssignment(assignmentId, reason);
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối nhiệm vụ", response));
    }

    @PatchMapping("/assignments/{assignmentId}/complete")
    @Operation(summary = "Collector hoàn thành nhiệm vụ")
    public ResponseEntity<ApiResponse<TaskAssignmentResponse>> completeAssignment(
            @PathVariable UUID assignmentId,
            @RequestParam Double collectedWeightKg,
            @RequestParam(required = false) String evidenceImages) {
        TaskAssignmentResponse response = taskService.completeAssignment(assignmentId, collectedWeightKg,
                evidenceImages);
        return ResponseEntity.ok(ApiResponse.success("Nhiệm vụ hoàn thành", response));
    }

    @GetMapping("/assignments/collector/{collectorId}")
    @Operation(summary = "Lấy danh sách nhiệm vụ của Collector")
    public ResponseEntity<ApiResponse<Page<TaskAssignmentResponse>>> getAssignmentsByCollector(
            @PathVariable UUID collectorId,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<TaskAssignmentResponse> response = taskService.getAssignmentsByCollector(collectorId, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
