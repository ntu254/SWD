package com.example.backendservice.features.collector.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COLLECTOR_KPI_DAILY
 * KPI hàng ngày của Collector
 */
@Entity
@Table(name = "collector_kpi_daily", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "collector_user_id", "area_id", "kpi_date" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorKpiDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "kpi_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID kpiId;

    /**
     * Collector (User có role COLLECTOR)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User collectorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea area;

    @Column(name = "kpi_date", nullable = false)
    private LocalDate kpiDate;

    /**
     * Mục tiêu: Khối lượng tối thiểu phải thu (kg)
     */
    @Column(name = "min_weight_kg")
    @Builder.Default
    private Double minWeightKg = 0.0;

    /**
     * Mục tiêu: Số lần thăm tối thiểu
     */
    @Column(name = "min_visits")
    @Builder.Default
    private Integer minVisits = 0;

    /**
     * Thực tế: Khối lượng đã thu (kg)
     */
    @Column(name = "actual_weight_kg")
    @Builder.Default
    private Double actualWeightKg = 0.0;

    /**
     * Thực tế: Số lần thăm đã thực hiện
     */
    @Column(name = "actual_visits")
    @Builder.Default
    private Integer actualVisits = 0;

    /**
     * Trạng thái KPI
     * PENDING: Chưa hoàn thành
     * MET: Đạt mục tiêu
     * NOT_MET: Không đạt mục tiêu
     */
    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING"; // PENDING, MET, NOT_MET

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public UUID getCollectorUserId() {
        return collectorUser != null ? collectorUser.getUserId() : null;
    }

    public boolean isKpiMet() {
        return actualWeightKg >= minWeightKg && actualVisits >= minVisits;
    }

    public void incrementVisit(Double weightKg) {
        this.actualVisits = (this.actualVisits == null ? 0 : this.actualVisits) + 1;
        this.actualWeightKg = (this.actualWeightKg == null ? 0.0 : this.actualWeightKg) + weightKg;
    }
}
