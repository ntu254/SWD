package com.example.backendservice.features.task.entity;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Nhiệm vụ thu gom rác (Collection Task)
 * Được tạo từ WasteReport và gán cho Collector
 */
@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // Source: Waste Report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_report_id")
    private WasteReport wasteReport;

    // Enterprise xử lý
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id", nullable = false)
    private Enterprise enterprise;

    // Khu vực
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private ServiceArea area;

    // Loại rác
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id")
    private WasteType wasteType;

    @Column(name = "estimated_weight_kg")
    private Double estimatedWeightKg;

    @Column(name = "actual_weight_kg")
    private Double actualWeightKg;

    @Column(name = "location_text", length = 500)
    private String locationText;

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "points_awarded")
    private Integer pointsAwarded;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
