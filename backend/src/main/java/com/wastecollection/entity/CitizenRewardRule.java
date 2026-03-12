package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "citizen_reward_rules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenRewardRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id")
    private UUID ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "sorting_level", nullable = false)
    private String sortingLevel;

    @Column(name = "points_fixed")
    private Double pointsFixed;

    @Column(name = "points_per_kg")
    private Double pointsPerKg;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    private Boolean isActive;
}
