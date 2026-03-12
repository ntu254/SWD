package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "visit_waste_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitWasteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id")
    private UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    private CollectionVisit visit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "sorting_level")
    private String sortingLevel;

    @Column(name = "contamination_note", columnDefinition = "text")
    private String contaminationNote;
}
