package com.example.backendservice.features.location.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng SERVICE_AREA
 * Khu vực hoạt động - định nghĩa vùng địa lý
 */
@Entity
@Table(name = "service_areas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceArea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "area_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID areaId;

    @Column(nullable = false, length = 200)
    private String name;

    /**
     * WKT (Well-Known Text) format cho boundary
     * Ví dụ: POLYGON((lng1 lat1, lng2 lat2, ...))
     */
    @Column(name = "geo_boundary_wkt", columnDefinition = "TEXT")
    private String geoBoundaryWkt;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
