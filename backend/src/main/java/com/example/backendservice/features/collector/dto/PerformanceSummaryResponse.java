package com.example.backendservice.features.collector.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for collector performance summary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceSummaryResponse {

    private long totalJobsAssigned;
    private long totalJobsCompleted;
    private long totalJobsFailed;
    private long totalJobsCancelled;
    private double completionRate; // percentage
    private Double averageCompletionTimeMinutes; // nullable if no completed jobs
}
