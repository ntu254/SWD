package com.example.backendservice.features.waste.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng WASTE_REPORT
 * Báo cáo rác - Citizen tạo báo cáo về rác cần thu gom
 */
@Entity
@Table(name = "waste_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "report_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID reportId;

    /**
     * Người tạo báo cáo (User có role CITIZEN)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User reporterUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea area;

    @Column(name = "requested_pickup_time")
    private LocalDateTime requestedPickupTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteType wasteType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "gps_accuracy_meters")
    private Double gpsAccuracyMeters;

    @Column(name = "report_photo_url")
    private String reportPhotoUrl;

    // Helper method
    public UUID getReporterUserId() {
        return reporterUser != null ? reporterUser.getUserId() : null;
    }
}
