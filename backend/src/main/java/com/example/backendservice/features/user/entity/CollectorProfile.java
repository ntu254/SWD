package com.example.backendservice.features.user.entity;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entity cho bảng COLLECTOR_PROFILE
 * Hồ sơ Collector thuộc một Enterprise
 */
import lombok.experimental.SuperBuilder;

/**
 * Entity cho bảng COLLECTOR_PROFILE
 * Hồ sơ Collector thuộc một Enterprise
 */
@Entity
@Table(name = "collector_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor

public class CollectorProfile extends User {


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

}
