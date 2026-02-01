package com.example.backendservice.features.collector.service;

import com.example.backendservice.common.exception.BadRequestException;
import com.example.backendservice.common.exception.ForbiddenException;
import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.collector.dto.*;
import com.example.backendservice.features.collector.entity.CollectionRequest;
import com.example.backendservice.features.collector.entity.StatusHistory;
import com.example.backendservice.features.collector.repository.CollectionRequestRepository;
import com.example.backendservice.features.collector.repository.StatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectorTaskServiceImpl implements CollectorTaskService {

    private final CollectionRequestRepository collectionRequestRepository;
    private final StatusHistoryRepository statusHistoryRepository;

    private static final String TARGET_TYPE = "COLLECTION_REQUEST";
    private static final String STATUS_ASSIGNED = "ASSIGNED";
    private static final String STATUS_ON_THE_WAY = "ON_THE_WAY";
    private static final String STATUS_COLLECTED = "COLLECTED";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private static final List<String> ACTIVE_STATUSES = List.of(STATUS_ASSIGNED, STATUS_ON_THE_WAY);
    private static final List<String> HISTORY_STATUSES = List.of(STATUS_COLLECTED, STATUS_FAILED, STATUS_CANCELLED);
    private static final Set<String> ALLOWED_TRANSITIONS_FROM_ON_THE_WAY = Set.of(STATUS_COLLECTED, STATUS_FAILED,
            STATUS_CANCELLED);

    @Override
    @Transactional(readOnly = true)
    public Page<CollectorTaskResponse> viewAssignedTasks(UUID collectorId, Pageable pageable) {
        log.debug("Fetching assigned tasks for collector: {}", collectorId);

        Page<CollectionRequest> tasks = collectionRequestRepository.findByCollectorIdAndStatusIn(
                collectorId, ACTIVE_STATUSES, pageable);

        return tasks.map(this::mapToTaskResponse);
    }

    @Override
    @Transactional
    public AcceptTaskResponse acceptTask(UUID taskId, UUID collectorId) {
        log.debug("Collector {} accepting task {}", collectorId, taskId);

        CollectionRequest task = getTaskOrThrow(taskId);

        // Validate ownership
        validateOwnership(task, collectorId);

        // Validate current status
        if (!STATUS_ASSIGNED.equals(task.getStatus())) {
            throw new BadRequestException(
                    "Task can only be accepted when status is ASSIGNED. Current status: " + task.getStatus());
        }

        // Update status
        String fromStatus = task.getStatus();
        task.setStatus(STATUS_ON_THE_WAY);
        task.setAcceptedAt(Instant.now());
        task.setOnWayAt(Instant.now());

        collectionRequestRepository.save(task);

        // Record status history
        recordStatusHistory(taskId, fromStatus, STATUS_ON_THE_WAY, collectorId, null);

        log.info("Task {} accepted by collector {}", taskId, collectorId);

        return AcceptTaskResponse.builder()
                .taskId(taskId)
                .status(STATUS_ON_THE_WAY)
                .acceptedAt(task.getAcceptedAt())
                .onWayAt(task.getOnWayAt())
                .message("Task accepted successfully")
                .build();
    }

    @Override
    @Transactional
    public CollectorTaskResponse updateTaskStatus(UUID taskId, UUID collectorId, UpdateTaskStatusRequest request) {
        log.debug("Collector {} updating task {} status to {}", collectorId, taskId, request.getStatus());

        CollectionRequest task = getTaskOrThrow(taskId);

        // Validate ownership
        validateOwnership(task, collectorId);

        // Validate current status is ON_THE_WAY
        if (!STATUS_ON_THE_WAY.equals(task.getStatus())) {
            throw new BadRequestException(
                    "Task status can only be updated when current status is ON_THE_WAY. Current status: "
                            + task.getStatus());
        }

        // Validate target status
        String newStatus = request.getStatus();
        if (!ALLOWED_TRANSITIONS_FROM_ON_THE_WAY.contains(newStatus)) {
            throw new BadRequestException("Invalid status transition. Allowed values: COLLECTED, FAILED, CANCELLED");
        }

        // Update status and timestamps
        String fromStatus = task.getStatus();
        task.setStatus(newStatus);

        if (STATUS_COLLECTED.equals(newStatus)) {
            task.setCollectedAt(Instant.now());
        }

        if (request.getNote() != null) {
            task.setNote(request.getNote());
        }

        collectionRequestRepository.save(task);

        // Record status history
        recordStatusHistory(taskId, fromStatus, newStatus, collectorId, request.getNote());

        log.info("Task {} status updated to {} by collector {}", taskId, newStatus, collectorId);

        return mapToTaskResponse(task);
    }

    @Override
    @Transactional
    public CollectorTaskResponse uploadProof(UUID taskId, UUID collectorId, UploadProofRequest request) {
        log.debug("Collector {} uploading proof for task {}", collectorId, taskId);

        CollectionRequest task = getTaskOrThrow(taskId);

        // Validate ownership
        validateOwnership(task, collectorId);

        // Validate status is COLLECTED
        if (!STATUS_COLLECTED.equals(task.getStatus())) {
            throw new BadRequestException(
                    "Proof can only be uploaded when status is COLLECTED. Current status: " + task.getStatus());
        }

        // Validate proof not already set
        if (task.getCollectorProofImageUrl() != null && !task.getCollectorProofImageUrl().isBlank()) {
            throw new BadRequestException("Proof image has already been uploaded and cannot be changed");
        }

        // Update proof image
        task.setCollectorProofImageUrl(request.getCollectorProofImageUrl());
        collectionRequestRepository.save(task);

        log.info("Proof uploaded for task {} by collector {}", taskId, collectorId);

        return mapToTaskResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobHistoryResponse> getJobHistory(UUID collectorId, Instant from, Instant to, Pageable pageable) {
        log.debug("Fetching job history for collector: {} from {} to {}", collectorId, from, to);

        Page<CollectionRequest> jobs;

        if (from != null && to != null) {
            jobs = collectionRequestRepository.findByCollectorIdAndStatusInAndCreatedAtBetween(
                    collectorId, HISTORY_STATUSES, from, to, pageable);
        } else {
            jobs = collectionRequestRepository.findByCollectorIdAndStatusIn(
                    collectorId, HISTORY_STATUSES, pageable);
        }

        return jobs.map(this::mapToJobHistoryResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PerformanceSummaryResponse getPerformanceSummary(UUID collectorId) {
        log.debug("Calculating performance summary for collector: {}", collectorId);

        long totalAssigned = collectionRequestRepository.countByCollectorId(collectorId);
        long totalCompleted = collectionRequestRepository.countByCollectorIdAndStatus(collectorId, STATUS_COLLECTED);
        long totalFailed = collectionRequestRepository.countByCollectorIdAndStatus(collectorId, STATUS_FAILED);
        long totalCancelled = collectionRequestRepository.countByCollectorIdAndStatus(collectorId, STATUS_CANCELLED);

        double completionRate = totalAssigned > 0
                ? (double) totalCompleted / totalAssigned * 100
                : 0.0;

        Double avgCompletionTimeSeconds = collectionRequestRepository
                .calculateAverageCompletionTimeSeconds(collectorId);
        Double avgCompletionTimeMinutes = avgCompletionTimeSeconds != null
                ? avgCompletionTimeSeconds / 60.0
                : null;

        return PerformanceSummaryResponse.builder()
                .totalJobsAssigned(totalAssigned)
                .totalJobsCompleted(totalCompleted)
                .totalJobsFailed(totalFailed)
                .totalJobsCancelled(totalCancelled)
                .completionRate(Math.round(completionRate * 100.0) / 100.0) // Round to 2 decimal places
                .averageCompletionTimeMinutes(avgCompletionTimeMinutes != null
                        ? Math.round(avgCompletionTimeMinutes * 100.0) / 100.0
                        : null)
                .build();
    }

    // ==================== PRIVATE HELPERS ====================

    private CollectionRequest getTaskOrThrow(UUID taskId) {
        return collectionRequestRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("CollectionRequest", "id", taskId));
    }

    private void validateOwnership(CollectionRequest task, UUID collectorId) {
        if (task.getCollectorId() == null || !task.getCollectorId().equals(collectorId)) {
            throw new ForbiddenException("You are not authorized to access this task");
        }
    }

    private void recordStatusHistory(UUID targetId, String fromStatus, String toStatus, UUID actorId, String meta) {
        StatusHistory history = StatusHistory.builder()
                .targetType(TARGET_TYPE)
                .targetId(targetId)
                .fromStatus(fromStatus)
                .toStatus(toStatus)
                .actorUserId(actorId)
                .timestamp(Instant.now())
                .meta(meta)
                .build();

        statusHistoryRepository.save(history);
        log.debug("Recorded status history: {} -> {} for target {}", fromStatus, toStatus, targetId);
    }

    private CollectorTaskResponse mapToTaskResponse(CollectionRequest task) {
        return CollectorTaskResponse.builder()
                .id(task.getId())
                .collectorId(task.getCollectorId())
                .reportId(task.getReportId())
                .enterpriseId(task.getEnterpriseId())
                .status(task.getStatus())
                .note(task.getNote())
                .collectorProofImageUrl(task.getCollectorProofImageUrl())
                .assignedAt(task.getAssignedAt())
                .acceptedAt(task.getAcceptedAt())
                .onWayAt(task.getOnWayAt())
                .collectedAt(task.getCollectedAt())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private JobHistoryResponse mapToJobHistoryResponse(CollectionRequest task) {
        Long completionTimeMinutes = null;
        if (task.getAssignedAt() != null && task.getCollectedAt() != null) {
            Duration duration = Duration.between(task.getAssignedAt(), task.getCollectedAt());
            completionTimeMinutes = duration.toMinutes();
        }

        return JobHistoryResponse.builder()
                .id(task.getId())
                .reportId(task.getReportId())
                .enterpriseId(task.getEnterpriseId())
                .status(task.getStatus())
                .note(task.getNote())
                .collectorProofImageUrl(task.getCollectorProofImageUrl())
                .assignedAt(task.getAssignedAt())
                .collectedAt(task.getCollectedAt())
                .createdAt(task.getCreatedAt())
                .completionTimeMinutes(completionTimeMinutes)
                .build();
    }
}
