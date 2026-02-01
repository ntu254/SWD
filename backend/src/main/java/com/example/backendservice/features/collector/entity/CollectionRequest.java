package com.example.backendservice.features.collector.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity for COLLECTION_REQUEST table.
 * Represents a collection task assigned to a collector.
 */
@Entity
@Table(name = "collection_requests")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "collector_id")
    private UUID collectorId;

    @Column(name = "report_id")
    private UUID reportId;

    @Column(name = "enterprise_id")
    private UUID enterpriseId;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ASSIGNED";

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "collector_proof_image_url")
    private String collectorProofImageUrl;

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "on_way_at")
    private Instant onWayAt;

    @Column(name = "collected_at")
    private Instant collectedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
