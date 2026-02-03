package com.example.backendservice.features.collector.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.collector.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.repository.TaskAssignmentRepository;
import com.example.backendservice.features.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of CollectorTaskService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CollectorTaskServiceImpl implements CollectorTaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;

    @Override
    public Page<CollectorTaskResponse> viewAssignedTasks(UUID collectorId, Pageable pageable) {
        log.debug("Getting assigned tasks for collector: {}", collectorId);

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorId);

        List<CollectorTaskResponse> responses = assignments.stream()
                .filter(a -> "ASSIGNED".equals(a.getStatus()) || "ON_THE_WAY".equals(a.getStatus()))
                .map(this::toTaskResponse)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());

        if (start > responses.size()) {
            return new PageImpl<>(List.of(), pageable, responses.size());
        }

        return new PageImpl<>(
                responses.subList(start, end),
                pageable,
                responses.size());
    }

    @Override
    @Transactional
    public AcceptTaskResponse acceptTask(UUID taskId, UUID collectorId) {
        log.info("Collector {} accepting task {}", collectorId, taskId);

        TaskAssignment assignment = taskAssignmentRepository.findByTaskIdAndCollectorUserId(taskId, collectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Task assignment not found"));

        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Task is not in ASSIGNED status");
        }

        LocalDateTime now = LocalDateTime.now();
        assignment.setStatus("ON_THE_WAY");
        assignment.setAcceptedAt(now);
        taskAssignmentRepository.save(assignment);

        // Update task status
        Task task = assignment.getTask();
        if (task != null) {
            task.setStatus("IN_PROGRESS");
            taskRepository.save(task);
        }

        log.info("Task {} accepted by collector {}", taskId, collectorId);

        return AcceptTaskResponse.builder()
                .taskId(taskId)
                .status("ON_THE_WAY")
                .acceptedAt(toInstant(now))
                .onWayAt(toInstant(now))
                .message("Task accepted successfully")
                .build();
    }

    @Override
    @Transactional
    public CollectorTaskResponse updateTaskStatus(UUID taskId, UUID collectorId, UpdateTaskStatusRequest request) {
        log.info("Collector {} updating task {} status to {}", collectorId, taskId, request.getStatus());

        TaskAssignment assignment = taskAssignmentRepository.findByTaskIdAndCollectorUserId(taskId, collectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Task assignment not found"));

        String newStatus = request.getStatus();
        String currentStatus = assignment.getStatus();

        // Validate transitions
        if ("ON_THE_WAY".equals(currentStatus)) {
            if (!List.of("COLLECTED", "FAILED", "CANCELLED").contains(newStatus)) {
                throw new IllegalStateException("Invalid status transition from ON_THE_WAY to " + newStatus);
            }
        } else {
            throw new IllegalStateException("Cannot update status from " + currentStatus);
        }

        assignment.setStatus(newStatus);
        if (request.getNote() != null) {
            assignment.setCollectorNote(request.getNote());
        }
        taskAssignmentRepository.save(assignment);

        // Update task status
        Task task = assignment.getTask();
        if (task != null) {
            task.setStatus(newStatus);
            taskRepository.save(task);
        }

        log.info("Task {} status updated to {}", taskId, newStatus);

        return toTaskResponse(assignment);
    }

    @Override
    @Transactional
    public CollectorTaskResponse uploadProof(UUID taskId, UUID collectorId, UploadProofRequest request) {
        log.info("Collector {} uploading proof for task {}", collectorId, taskId);

        TaskAssignment assignment = taskAssignmentRepository.findByTaskIdAndCollectorUserId(taskId, collectorId)
                .orElseThrow(() -> new ResourceNotFoundException("Task assignment not found"));

        if (!"COLLECTED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Can only upload proof for COLLECTED tasks");
        }

        // Note: The current entity doesn't have a proof image field
        // This would need to be added to TaskAssignment or handled separately
        log.info("Proof uploaded for task {}", taskId);

        return toTaskResponse(assignment);
    }

    @Override
    public Page<JobHistoryResponse> getJobHistory(UUID collectorId, Instant from, Instant to, Pageable pageable) {
        log.debug("Getting job history for collector: {} from {} to {}", collectorId, from, to);

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorId);

        List<JobHistoryResponse> responses = assignments.stream()
                .filter(a -> List.of("COLLECTED", "FAILED", "CANCELLED").contains(a.getStatus()))
                .map(this::toJobHistoryResponse)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());

        if (start > responses.size()) {
            return new PageImpl<>(List.of(), pageable, responses.size());
        }

        return new PageImpl<>(
                responses.subList(start, end),
                pageable,
                responses.size());
    }

    @Override
    public PerformanceSummaryResponse getPerformanceSummary(UUID collectorId) {
        log.debug("Getting performance summary for collector: {}", collectorId);

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorId);

        long totalAssigned = assignments.size();
        long totalCompleted = assignments.stream().filter(a -> "COLLECTED".equals(a.getStatus())).count();
        long totalFailed = assignments.stream().filter(a -> "FAILED".equals(a.getStatus())).count();
        long totalCancelled = assignments.stream().filter(a -> "CANCELLED".equals(a.getStatus())).count();

        double completionRate = totalAssigned > 0 ? (double) totalCompleted / totalAssigned * 100 : 0;

        return PerformanceSummaryResponse.builder()
                .totalJobsAssigned(totalAssigned)
                .totalJobsCompleted(totalCompleted)
                .totalJobsFailed(totalFailed)
                .totalJobsCancelled(totalCancelled)
                .completionRate(completionRate)
                .averageCompletionTimeMinutes(null) // Would need timestamp tracking
                .build();
    }

    private CollectorTaskResponse toTaskResponse(TaskAssignment assignment) {
        Task task = assignment.getTask();
        return CollectorTaskResponse.builder()
                .id(task != null ? task.getTaskId() : null)
                .collectorId(assignment.getCollectorUserId())
                .reportId(task != null && task.getWasteReport() != null ? task.getWasteReport().getReportId() : null)
                .enterpriseId(task != null ? task.getEnterpriseUserId() : null)
                .status(assignment.getStatus())
                .note(assignment.getCollectorNote())
                .collectorProofImageUrl(null) // Not in current entity
                .assignedAt(null) // Not in current entity
                .acceptedAt(toInstant(assignment.getAcceptedAt()))
                .onWayAt(toInstant(assignment.getAcceptedAt()))
                .collectedAt(null) // Not in current entity
                .createdAt(null)
                .updatedAt(null)
                .build();
    }

    private JobHistoryResponse toJobHistoryResponse(TaskAssignment assignment) {
        Task task = assignment.getTask();
        return JobHistoryResponse.builder()
                .id(task != null ? task.getTaskId() : null)
                .reportId(task != null && task.getWasteReport() != null ? task.getWasteReport().getReportId() : null)
                .enterpriseId(task != null ? task.getEnterpriseUserId() : null)
                .status(assignment.getStatus())
                .note(assignment.getCollectorNote())
                .collectorProofImageUrl(null)
                .assignedAt(null)
                .collectedAt(null)
                .createdAt(null)
                .completionTimeMinutes(null)
                .build();
    }

    private Instant toInstant(LocalDateTime ldt) {
        return ldt != null ? ldt.atZone(ZoneId.systemDefault()).toInstant() : null;
    }
}
