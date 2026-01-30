package com.example.backendservice.features.waste.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.Citizen;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Báo cáo rác (Waste Report)
 * Citizen tạo báo cáo về rác cần thu gom
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
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    // Citizen tạo report
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    // Khu vực
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private ServiceArea area;

    // Loại rác chính (optional, có thể nhiều loại)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_waste_type_id")
    private WasteType primaryWasteType;

    @Column(name = "estimated_weight_kg")
    private Double estimatedWeightKg;

    @Column(name = "location_text", length = 500)
    private String locationText; // Địa chỉ chi tiết

    @Column(name = "lat")
    private Double lat;

    @Column(name = "lng")
    private Double lng;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // JSON array of image URLs

    @Column(length = 50)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ACCEPTED, REJECTED, ASSIGNED, COMPLETED, CANCELLED

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "preferred_date")
    private LocalDateTime preferredDate; // Ngày Citizen muốn thu gom

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
