package com.example.backendservice.features.collector.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.collector.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.entity.TaskAssignmentStatus;
import com.example.backendservice.features.task.entity.TaskStatus;
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
    private final com.example.backendservice.features.collection.repository.CollectionVisitRepository visitRepository;
    private final com.example.backendservice.features.collection.repository.EvidencePhotoRepository photoRepository;
    private final com.example.backendservice.features.waste.repository.WasteTypeRepository wasteTypeRepository;
    private final com.example.backendservice.features.collection.repository.VisitWasteItemRepository wasteItemRepository;

    @Override
    public Page<CollectorTaskResponse> viewAssignedTasks(UUID collectorId, Pageable pageable) {
        log.debug("Getting assigned tasks for collector: {}", collectorId);

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorId);

        List<CollectorTaskResponse> responses = assignments.stream()
                .filter(a -> a.getStatus() == TaskAssignmentStatus.ASSIGNED
                        || a.getStatus() == TaskAssignmentStatus.ON_THE_WAY)
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

        if (assignment.getStatus() != TaskAssignmentStatus.ASSIGNED) {
            throw new IllegalStateException("Task is not in ASSIGNED status");
        }

        LocalDateTime now = LocalDateTime.now();
        assignment.setStatus(TaskAssignmentStatus.ON_THE_WAY);
        assignment.setAcceptedAt(now);
        taskAssignmentRepository.save(assignment);

        // Update task status
        Task task = assignment.getTask();
        if (task != null) {
            task.setStatus(TaskStatus.IN_PROGRESS);
            taskRepository.save(task);
        }

        log.info("Task {} accepted by collector {}", taskId, collectorId);

        return AcceptTaskResponse.builder()
                .taskId(taskId)
                .status(TaskAssignmentStatus.ON_THE_WAY)
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

        TaskAssignmentStatus newStatus = request.getStatus();
        TaskAssignmentStatus currentStatus = assignment.getStatus();

        // Validate transitions
        if (currentStatus == TaskAssignmentStatus.ON_THE_WAY) {
            if (!List.of(
                    TaskAssignmentStatus.COLLECTED,
                    TaskAssignmentStatus.FAILED,
                    TaskAssignmentStatus.CANCELLED).contains(newStatus)) {
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
            task.setStatus(mapAssignmentStatusToTaskStatus(newStatus));
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

        if (assignment.getStatus() != TaskAssignmentStatus.COLLECTED && assignment.getStatus() != TaskAssignmentStatus.ON_THE_WAY) {
            throw new IllegalStateException("Can only upload proof for IN_PROGRESS or COLLECTED tasks");
        }
        
        // Ensure task is marked as COLLECTED
        assignment.setStatus(TaskAssignmentStatus.COLLECTED);
        taskAssignmentRepository.save(assignment);
        
        Task task = assignment.getTask();
        if (task != null) {
            task.setStatus(TaskStatus.COLLECTED);
            taskRepository.save(task);
        }

        // Auto-create CollectionVisit to tie it to the new verification flow
        try {
            // Find existing visit or create new one
            com.example.backendservice.features.collection.entity.CollectionVisit visit = visitRepository.findByTaskId(taskId)
                .stream().findFirst().orElseGet(() -> {
                     com.example.backendservice.features.collection.entity.CollectionVisit newVisit = com.example.backendservice.features.collection.entity.CollectionVisit.builder()
                        .task(task)
                        .collectorUser(assignment.getCollectorUser())
                        .visitedAt(LocalDateTime.now())
                        .visitStatus("PENDING_REWARD") // Waiting for Enterprise to approve
                        .build();
                     return visitRepository.save(newVisit);
                });

            // Save evidence photo
            com.example.backendservice.features.collection.entity.EvidencePhoto photo = com.example.backendservice.features.collection.entity.EvidencePhoto.builder()
                        .visit(visit)
                        .photoUrl(request.getCollectorProofImageUrl())
                        .takenAt(LocalDateTime.now())
                        .note("AFTER")
                        .build();
            photoRepository.save(photo);
            
            // Save waste item if provided
            if (request.getWasteTypeId() != null && request.getWeightKg() != null) {
                com.example.backendservice.features.waste.entity.WasteType wasteType = wasteTypeRepository.findByWasteTypeId(UUID.fromString(request.getWasteTypeId()))
                        .orElseThrow(() -> new ResourceNotFoundException("Waste type not found"));
                        
                com.example.backendservice.features.collection.entity.VisitWasteItem item = com.example.backendservice.features.collection.entity.VisitWasteItem.builder()
                                .visit(visit)
                                .wasteType(wasteType)
                                .weightKg(request.getWeightKg())
                                .sortingLevel("GOOD")
                                .build();
                wasteItemRepository.save(item);
            }
            
            log.info("CollectionVisit created/updated with proof for task {}", taskId);
        } catch (Exception e) {
            log.error("Failed to auto-create collection visit for task {}: {}", taskId, e.getMessage());
        }

        return toTaskResponse(assignment);
    }

    @Override
    public Page<JobHistoryResponse> getJobHistory(UUID collectorId, Instant from, Instant to, Pageable pageable) {
        log.debug("Getting job history for collector: {} from {} to {}", collectorId, from, to);

        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorId);

        List<JobHistoryResponse> responses = assignments.stream()
                .filter(a -> List.of(
                        TaskAssignmentStatus.COLLECTED,
                        TaskAssignmentStatus.FAILED,
                        TaskAssignmentStatus.CANCELLED).contains(a.getStatus()))
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
        long totalCompleted = assignments.stream().filter(a -> a.getStatus() == TaskAssignmentStatus.COLLECTED).count();
        long totalFailed = assignments.stream().filter(a -> a.getStatus() == TaskAssignmentStatus.FAILED).count();
        long totalCancelled = assignments.stream().filter(a -> a.getStatus() == TaskAssignmentStatus.CANCELLED).count();

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

    private TaskStatus mapAssignmentStatusToTaskStatus(TaskAssignmentStatus status) {
        return switch (status) {
            case COLLECTED -> TaskStatus.COLLECTED;
            case FAILED -> TaskStatus.FAILED;
            case CANCELLED -> TaskStatus.CANCELLED;
            case ON_THE_WAY -> TaskStatus.IN_PROGRESS;
            case ASSIGNED -> TaskStatus.ASSIGNED;
            default -> TaskStatus.IN_PROGRESS;
        };
    }
}
