package com.example.backendservice.features.collector.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity for COLLECTOR_LOCATION_LOG table.
 * Records collector GPS locations for tracking purposes.
 */
@Entity
@Table(name = "collector_location_logs", indexes = {
        @Index(name = "idx_collector_location_recorded", columnList = "collector_id, recorded_at DESC")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorLocationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "collector_id", nullable = false)
    private UUID collectorId;

    @Column(name = "lat", nullable = false)
    private Double lat;

    @Column(name = "lng", nullable = false)
    private Double lng;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;
}
