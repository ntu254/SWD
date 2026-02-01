package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRewardRuleRequest {

    @NotNull(message = "Waste Type ID is required")
    private UUID wasteTypeId;

    @NotNull(message = "Points per kg is required")
    @Positive(message = "Points per kg must be positive")
    private Double pointsPerKg;

    private Double bonusPercentage;
    private Double minWeightKg;
    private Integer maxPointsPerDay;
    private String description;
    private LocalDateTime validFrom;
    private LocalDateTime validUntil;
}
