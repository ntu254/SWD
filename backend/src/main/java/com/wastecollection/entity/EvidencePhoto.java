package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "evidence_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidencePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "photo_id")
    private UUID photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id", nullable = false)
    private CollectionVisit visit;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;
}
