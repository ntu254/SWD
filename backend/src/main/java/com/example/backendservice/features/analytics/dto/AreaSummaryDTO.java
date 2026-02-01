package com.example.backendservice.features.analytics.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaSummaryDTO {

    private UUID areaId;
    private String areaName;
    private Long taskCount;
    private Long completedTasks;
    private Double totalWeightKg;
    private Double percentageOfTotal;
    private Long activeCollectors;
}
