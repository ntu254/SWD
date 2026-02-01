package com.example.backendservice.features.user.entity;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COLLECTOR_PROFILE
 * Hồ sơ Collector thuộc một Enterprise
 */
@Entity
@Table(name = "collector_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorProfile {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise;

    @Column(name = "availability_status", length = 20)
    @Builder.Default
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, BUSY, OFFLINE

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "max_load_kg")
    private Double maxLoadKg;

    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
