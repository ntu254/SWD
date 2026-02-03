package com.example.backendservice.features.reward.entity;

import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity cho bảng CITIZEN_REWARD_RULE
 * Quy tắc tính điểm thưởng cho Citizen theo loại rác và mức độ phân loại
 */
@Entity
@Table(name = "citizen_reward_rules", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "waste_type_id", "sorting_level" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenRewardRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "rule_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteType wasteType;

    /**
     * Mức độ phân loại rác
     * GOOD: Phân loại tốt
     * FAIR: Phân loại trung bình
     * POOR: Phân loại kém
     */
    @Column(name = "sorting_level", length = 20, nullable = false)
    private String sortingLevel; // GOOD, FAIR, POOR

    /**
     * Điểm tính theo kg
     */
    @Column(name = "points_per_kg")
    private Double pointsPerKg;

    /**
     * Điểm cố định (không phụ thuộc weight)
     */
    @Column(name = "points_fixed")
    private Double pointsFixed;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    // Helper methods
    public UUID getWasteTypeId() {
        return wasteType != null ? wasteType.getWasteTypeId() : null;
    }

    public boolean isEffective(LocalDate date) {
        if (!Boolean.TRUE.equals(isActive)) {
            return false;
        }
        if (effectiveFrom != null && date.isBefore(effectiveFrom)) {
            return false;
        }
        if (effectiveTo != null && date.isAfter(effectiveTo)) {
            return false;
        }
        return true;
    }

    /**
     * Tính điểm thưởng cho một lần thu gom
     */
    public double calculatePoints(Double weightKg) {
        double points = 0.0;
        if (pointsFixed != null) {
            points += pointsFixed;
        }
        if (pointsPerKg != null && weightKg != null) {
            points += pointsPerKg * weightKg;
        }
        return points;
    }
}
