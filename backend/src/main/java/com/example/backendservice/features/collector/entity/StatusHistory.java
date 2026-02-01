package com.example.backendservice.features.collector.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Entity for STATUS_HISTORY table.
 * Records status transitions for collection requests and other entities.
 */
@Entity
@Table(name = "status_histories", indexes = {
        @Index(name = "idx_status_target", columnList = "target_type, target_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "target_type", length = 50, nullable = false)
    private String targetType;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(name = "from_status", length = 30)
    private String fromStatus;

    @Column(name = "to_status", length = 30, nullable = false)
    private String toStatus;

    @Column(name = "actor_user_id")
    private UUID actorUserId;

    @Column(name = "timestamp", nullable = false)
    private Instant timestamp;

    @Column(name = "meta", columnDefinition = "TEXT")
    private String meta;
}
