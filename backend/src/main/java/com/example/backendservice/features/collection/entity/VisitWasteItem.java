package com.example.backendservice.features.collection.entity;

import com.example.backendservice.features.waste.entity.WasteType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity cho bảng VISIT_WASTE_ITEM
 * Chi tiết về loại rác được thu gom trong một lần thăm
 */
@Entity
@Table(name = "visit_waste_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitWasteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CollectionVisit visit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteType wasteType;

    /**
     * Mức độ phân loại rác
     * GOOD: Phân loại tốt
     * FAIR: Phân loại trung bình
     * POOR: Phân loại kém
     */
    @Column(name = "sorting_level", length = 20)
    @Builder.Default
    private String sortingLevel = "GOOD"; // GOOD, FAIR, POOR

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "contamination_note", columnDefinition = "TEXT")
    private String contaminationNote;

    // Helper methods
    public UUID getVisitId() {
        return visit != null ? visit.getVisitId() : null;
    }

    public UUID getWasteTypeId() {
        return wasteType != null ? wasteType.getWasteTypeId() : null;
    }
}
