package com.example.backendservice.features.collector.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorKpiDailyResponse {
    private UUID kpiId;
    private UUID collectorUserId;
    private String collectorName;
    private UUID areaId;
    private String areaName;
    private LocalDate kpiDate;

    // Targets
    private Double minWeightKg;
    private Integer minVisits;

    // Actuals
    private Double actualWeightKg;
    private Integer actualVisits;

    // Calculated
    private Double weightProgress; // percentage
    private Double visitsProgress; // percentage

    private String status;
    private LocalDateTime updatedAt;
}
