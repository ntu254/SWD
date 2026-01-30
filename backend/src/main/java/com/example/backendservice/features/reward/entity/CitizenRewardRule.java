package com.example.backendservice.features.reward.entity;

import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Quy tắc tính điểm thưởng cho Citizen
 * Định nghĩa số điểm cho mỗi kg rác theo loại
 */
@Entity
@Table(name = "citizen_reward_rules", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "waste_type_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenRewardRule {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "points_per_kg", nullable = false)
    private Double pointsPerKg;

    @Column(name = "bonus_percentage")
    @Builder.Default
    private Double bonusPercentage = 0.0; // Extra % for special events

    @Column(name = "min_weight_kg")
    @Builder.Default
    private Double minWeightKg = 0.0; // Minimum weight to qualify

    @Column(name = "max_points_per_day")
    private Integer maxPointsPerDay; // Daily cap

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @Column(name = "valid_from")
    private LocalDateTime validFrom;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Calculate points for given weight
    public Integer calculatePoints(Double weightKg) {
        if (weightKg < minWeightKg) {
            return 0;
        }
        double basePoints = weightKg * pointsPerKg;
        double bonus = basePoints * (bonusPercentage / 100.0);
        int totalPoints = (int) Math.floor(basePoints + bonus);

        if (maxPointsPerDay != null && totalPoints > maxPointsPerDay) {
            return maxPointsPerDay;
        }
        return totalPoints;
    }
}
