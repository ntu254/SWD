package com.example.backendservice.features.enterprise.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Entity cho bảng ENTERPRISE_CAPABILITY
 * Năng lực xử lý của Enterprise theo loại rác và khu vực
 */
@Entity
@Table(name = "enterprise_capabilities", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "enterprise_user_id", "waste_type_id", "service_area_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseCapability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "capability_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID capabilityId;

    /**
     * Enterprise (User có role ENTERPRISE)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User enterpriseUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteType wasteType;

    @Column(name = "daily_capacity_kg", nullable = false)
    private Double dailyCapacityKg;

    /**
     * Công suất đã sử dụng trong ngày hiện tại (kg)
     * Reset về 0 mỗi ngày bởi scheduled job
     */
    @Column(name = "used_capacity_kg")
    @Builder.Default
    private Double usedCapacityKg = 0.0;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_area_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea serviceArea;

    // Helper methods
    public UUID getEnterpriseUserId() {
        return enterpriseUser != null ? enterpriseUser.getUserId() : null;
    }

    public boolean isEffective(LocalDate date) {
        if (effectiveFrom != null && date.isBefore(effectiveFrom)) {
            return false;
        }
        if (effectiveTo != null && date.isAfter(effectiveTo)) {
            return false;
        }
        return true;
    }

    /**
     * Tính công suất còn lại trong ngày
     */
    public Double getAvailableCapacity() {
        double used = usedCapacityKg != null ? usedCapacityKg : 0.0;
        double daily = dailyCapacityKg != null ? dailyCapacityKg : 0.0;
        return Math.max(0, daily - used);
    }

    /**
     * Kiểm tra còn đủ công suất không
     */
    public boolean hasAvailableCapacity(Double weightKg) {
        return getAvailableCapacity() >= weightKg;
    }

    /**
     * Tăng công suất đã sử dụng
     */
    public void incrementUsedCapacity(Double weightKg) {
        if (weightKg != null && weightKg > 0) {
            this.usedCapacityKg = (this.usedCapacityKg != null ? this.usedCapacityKg : 0.0) + weightKg;
        }
    }

    /**
     * Reset công suất đã sử dụng về 0 (cho daily reset job)
     */
    public void resetUsedCapacity() {
        this.usedCapacityKg = 0.0;
    }
}
