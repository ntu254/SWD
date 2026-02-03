package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRewardRuleRequest {

    @NotBlank(message = "Sorting level is required")
    private String sortingLevel; // NONE, BASIC, INTERMEDIATE, ADVANCED

    @NotNull(message = "Points fixed is required")
    private Integer pointsFixed;

    @NotNull(message = "Multiplier is required")
    private Double multiplier;

    @NotNull(message = "Effective from date is required")
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;
}
