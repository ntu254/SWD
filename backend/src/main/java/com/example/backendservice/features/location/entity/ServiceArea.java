package com.example.backendservice.features.location.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Khu vực hoạt động (Service Area)
 * Định nghĩa vùng địa lý mà Enterprise/Collector phục vụ
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
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(length = 500)
    private String description;

    // Polygon hoặc tọa độ trung tâm
    @Column(name = "center_lat")
    private Double centerLat;

    @Column(name = "center_lng")
    private Double centerLng;

    @Column(name = "radius_km")
    private Double radiusKm;

    // GeoJSON boundary (optional, for complex areas)
    @Column(name = "boundary_geojson", columnDefinition = "TEXT")
    private String boundaryGeoJson;

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
