package com.example.backendservice.features.analytics.dto;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteTypeSummaryDTO {

    private UUID wasteTypeId;
    private String wasteTypeName;
    private Long taskCount;
    private Double totalWeightKg;
    private Double percentageOfTotal;
    private Integer pointsAwarded;
}
