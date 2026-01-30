package com.example.backendservice.features.enterprise.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Năng lực xử lý của Enterprise (Enterprise Capability)
 * Định nghĩa loại rác và công suất xử lý cho mỗi khu vực
 */
@Entity
@Table(name = "enterprise_capabilities", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "enterprise_id", "area_id", "waste_type_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseCapability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private ServiceArea area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "daily_capacity_kg", nullable = false)
    private Double dailyCapacityKg;

    @Column(name = "used_capacity_kg")
    @Builder.Default
    private Double usedCapacityKg = 0.0;

    @Column(name = "price_per_kg")
    private Double pricePerKg;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method
    public Double getAvailableCapacity() {
        return dailyCapacityKg - usedCapacityKg;
    }

    public boolean hasCapacity(Double requiredKg) {
        return getAvailableCapacity() >= requiredKg;
    }
}
