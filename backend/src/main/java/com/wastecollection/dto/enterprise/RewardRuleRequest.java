package com.wastecollection.dto.enterprise;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class RewardRuleRequest {
    @NotNull(message = "Waste type ID is required")
    private UUID wasteTypeId;

    @NotBlank(message = "Sorting level is required (GOOD, ACCEPTABLE, POOR)")
    private String sortingLevel;

    private Double pointsFixed;
    private Double pointsPerKg;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isActive;
}
