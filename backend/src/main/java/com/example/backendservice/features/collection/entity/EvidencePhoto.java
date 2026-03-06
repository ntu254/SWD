package com.example.backendservice.features.collection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng EVIDENCE_PHOTO
 * Ảnh bằng chứng cho một lần thăm thu gom
 */
@Entity
@Table(name = "evidence_photos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidencePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "photo_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CollectionVisit visit;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Column(columnDefinition = "TEXT")
    private String note;

    // Helper method
    public UUID getVisitId() {
        return visit != null ? visit.getVisitId() : null;
    }
}
