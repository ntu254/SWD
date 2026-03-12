package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "waste_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteReport {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "report_id")
    private UUID reportId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_user_id", nullable = false)
    private User reporter;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id")
    private WasteType wasteType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private ServiceArea area;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "gps_accuracy_meters")
    private Double gpsAccuracyMeters;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "report_photo_url")
    private String reportPhotoUrl;

    @Column(name = "status")
    private String status;

    @Column(name = "requested_pickup_time")
    private LocalDateTime requestedPickupTime;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
