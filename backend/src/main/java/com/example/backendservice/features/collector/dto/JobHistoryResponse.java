package com.example.backendservice.features.collector.dto;

import com.example.backendservice.features.task.entity.TaskAssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for job history
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobHistoryResponse {

    private UUID id;
    private UUID reportId;
    private UUID enterpriseId;
    private TaskAssignmentStatus status;
    private String note;
    private String collectorProofImageUrl;
    private Instant assignedAt;
    private Instant collectedAt;
    private Instant createdAt;

    // Computed field: time taken from assigned to collected (in minutes)
    private Long completionTimeMinutes;
}
