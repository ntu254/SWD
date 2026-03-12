package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "waste_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "waste_type_id")
    private UUID wasteTypeId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_recyclable")
    private Boolean isRecyclable;
}
