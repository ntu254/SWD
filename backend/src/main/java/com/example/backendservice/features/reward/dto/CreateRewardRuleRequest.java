package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRewardRuleRequest {

    @NotNull(message = "Waste type ID is required")
    private UUID wasteTypeId;

    @NotBlank(message = "Sorting level is required")
    private String sortingLevel; // GOOD, FAIR, POOR

    private Integer pointsFixed;

    @NotNull(message = "Points per kg is required")
    @Positive(message = "Points per kg must be positive")
    private Double pointsPerKg;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}
