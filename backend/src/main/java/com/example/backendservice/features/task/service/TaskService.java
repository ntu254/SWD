package com.example.backendservice.features.task.service;

import com.example.backendservice.features.task.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaskService {

    // Task CRUD
    TaskResponse createTask(CreateTaskRequest request);

    TaskResponse getTaskById(UUID taskId);

    Page<TaskResponse> getTasksByArea(UUID areaId, Pageable pageable);

    Page<TaskResponse> getTasksByStatus(String status, Pageable pageable);

    Page<TaskResponse> getTasksByScheduledDate(LocalDate date, Pageable pageable);

    Page<TaskResponse> getAllTasks(Pageable pageable);

    // Task status management
    TaskResponse updateTaskStatus(UUID taskId, String status);

    void cancelTask(UUID taskId);

    // Task assignment
    TaskAssignmentResponse assignTask(AssignTaskRequest request);

    TaskAssignmentResponse acceptAssignment(UUID assignmentId);

    TaskAssignmentResponse rejectAssignment(UUID assignmentId);

    TaskAssignmentResponse completeAssignment(UUID assignmentId);

    // Get assignments
    TaskAssignmentResponse getAssignmentById(UUID assignmentId);

    List<TaskAssignmentResponse> getAssignmentsByTask(UUID taskId);

    Page<TaskAssignmentResponse> getAssignmentsByCollector(UUID collectorUserId, Pageable pageable);

    Page<TaskAssignmentResponse> getPendingAssignmentsByCollector(UUID collectorUserId, Pageable pageable);
}
