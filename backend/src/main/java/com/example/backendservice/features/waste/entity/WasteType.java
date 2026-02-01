package com.example.backendservice.features.waste.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Loại rác (Waste Type)
 * Phân loại các loại rác tái chế
 */
@Entity
@Table(name = "waste_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false, unique = true, length = 100)
    private String name; // e.g., "Plastic", "Paper", "Metal", "Glass", "E-Waste"

    @Column(name = "name_vi", length = 100)
    private String nameVi; // Tên tiếng Việt: "Nhựa", "Giấy", "Kim loại"

    @Column(length = 500)
    private String description;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    @Column(name = "color_code", length = 20)
    private String colorCode; // Hex color for UI, e.g., "#4CAF50"

    @Column(name = "base_points_per_kg")
    @Builder.Default
    private Double basePointsPerKg = 10.0; // Default points per kg

    @Column(length = 50)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
