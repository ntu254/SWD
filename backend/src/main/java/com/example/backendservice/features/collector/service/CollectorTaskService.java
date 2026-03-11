package com.example.backendservice.features.collector.service;

import com.example.backendservice.features.collector.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.UUID;

/**
 * Service interface for Collector task management
 */
public interface CollectorTaskService {

    /**
     * View tasks assigned to the collector
     * Default statuses: ASSIGNED, ON_THE_WAY
     */
    Page<CollectorTaskResponse> viewAssignedTasks(UUID collectorId, Pageable pageable);

    /**
     * Accept an assigned task
     * Transition: ASSIGNED → ON_THE_WAY
     */
    AcceptTaskResponse acceptTask(UUID taskId, UUID collectorId);

    /**
     * Update task status
     * Allowed transitions from ON_THE_WAY: COLLECTED, FAILED, CANCELLED
     */
    CollectorTaskResponse updateTaskStatus(UUID taskId, UUID collectorId, UpdateTaskStatusRequest request);

    /**
     * Upload proof image for completed task
     * Only allowed when status = COLLECTED
     */
    CollectorTaskResponse uploadProof(UUID taskId, UUID collectorId, UploadProofRequest request);

    /**
     * Get job history (completed, failed, cancelled jobs)
     */
    Page<JobHistoryResponse> getJobHistory(UUID collectorId, Instant from, Instant to, Pageable pageable);

    /**
     * Get performance summary metrics
     */
    PerformanceSummaryResponse getPerformanceSummary(UUID collectorId);
}
