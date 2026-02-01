package com.example.backendservice.features.collector.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO for viewing assigned tasks
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorTaskResponse {

    private UUID id;
    private UUID collectorId;
    private UUID reportId;
    private UUID enterpriseId;
    private String status;
    private String note;
    private String collectorProofImageUrl;
    private Instant assignedAt;
    private Instant acceptedAt;
    private Instant onWayAt;
    private Instant collectedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
