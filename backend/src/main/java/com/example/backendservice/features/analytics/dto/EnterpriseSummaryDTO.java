package com.example.backendservice.features.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseSummaryDTO {

    private Long totalTasks;
    private Long pendingTasks;
    private Long completedTasks;
    private Long cancelledTasks;

    private Double totalWeightCollectedKg;
    private Double averageWeightPerTaskKg;

    private Long totalReportsReceived;
    private Long reportsAccepted;
    private Long reportsRejected;

    private Long activeCollectors;
    private Double averageTasksPerCollector;

    private Integer totalPointsAwarded;

    private LocalDate periodStart;
    private LocalDate periodEnd;
}
