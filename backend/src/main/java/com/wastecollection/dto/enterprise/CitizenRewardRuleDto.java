package com.wastecollection.dto.enterprise;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class CitizenRewardRuleDto {
    private UUID ruleId;
    private UUID wasteTypeId;
    private String wasteTypeName;
    /** GOOD, ACCEPTABLE, POOR */
    private String sortingLevel;
    private Double pointsFixed;
    private Double pointsPerKg;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Boolean isActive;
}
