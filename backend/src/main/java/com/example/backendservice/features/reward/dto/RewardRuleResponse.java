package com.example.backendservice.features.reward.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardRuleResponse {

    private UUID id;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private Double pointsPerKg;
    private Double bonusPercentage;
    private Double minWeightKg;
    private Integer maxPointsPerDay;
    private String description;
    private String status;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
}
