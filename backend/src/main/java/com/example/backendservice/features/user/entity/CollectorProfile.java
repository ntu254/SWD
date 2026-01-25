package com.example.backendservice.features.user.entity;

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
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "enterprise_id")
    private Long enterpriseId; // FK to Enterprise (khi có Enterprise entity)

    @Column(name = "availability_status", length = 20)
    @Builder.Default
    private String availabilityStatus = "available"; // available, busy

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "max_load_kg")
    private Double maxLoadKg;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
