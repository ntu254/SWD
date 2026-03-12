package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "service_areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceArea {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "area_id")
    private UUID areaId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "geo_boundary_wkt", columnDefinition = "text")
    private String geoBoundaryWkt;

    @Column(name = "is_active")
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
