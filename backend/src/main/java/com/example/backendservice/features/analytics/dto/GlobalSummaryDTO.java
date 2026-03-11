package com.example.backendservice.features.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSummaryDTO {
    private Long totalTasks;
    private Long completedTasks;
    private Long activeCollectors;
    private Double totalWeightCollectedKg;
    private Long totalUsers;
    private Long totalCitizens;
    private Long totalEnterprises;
    private LocalDate periodStart;
    private LocalDate periodEnd;
}
