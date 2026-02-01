package com.example.backendservice.features.task.service;

import com.example.backendservice.features.task.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface TaskService {

    // Task CRUD
    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse getTaskById(UUID id);

    Page<TaskResponse> getTasksByEnterprise(UUID enterpriseId, String status, Pageable pageable);

    Page<TaskResponse> getTasksByArea(UUID areaId, Pageable pageable);

    TaskResponse updateTask(UUID id, CreateTaskRequest request);

    void deleteTask(UUID id);

    // Task Status Flow
    TaskResponse startTask(UUID taskId);

    TaskResponse completeTask(UUID taskId, Double actualWeightKg);

    TaskResponse cancelTask(UUID taskId, String reason);

    // Task Assignment
    TaskAssignmentResponse assignTask(AssignTaskRequest request);

    TaskAssignmentResponse acceptAssignment(UUID assignmentId);

    TaskAssignmentResponse rejectAssignment(UUID assignmentId, String reason);

    TaskAssignmentResponse completeAssignment(UUID assignmentId, Double collectedWeightKg, String evidenceImages);

    Page<TaskAssignmentResponse> getAssignmentsByCollector(UUID collectorId, String status, Pageable pageable);
}
