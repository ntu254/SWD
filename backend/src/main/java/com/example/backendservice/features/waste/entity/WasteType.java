package com.example.backendservice.features.waste.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity cho bảng WASTE_TYPE
 * Loại rác - phân loại các loại rác tái chế
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
    @Column(name = "waste_type_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID wasteTypeId;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "is_recyclable")
    @Builder.Default
    private Boolean isRecyclable = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
