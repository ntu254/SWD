package com.example.backendservice.features.reward.dto;

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
public class RewardRuleResponse {
    private UUID ruleId;
    private String sortingLevel; // NONE, BASIC, INTERMEDIATE, ADVANCED
    private Integer pointsFixed;
    private Double multiplier;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private LocalDateTime createdAt;
}
