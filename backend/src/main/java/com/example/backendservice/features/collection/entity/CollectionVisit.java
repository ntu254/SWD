package com.example.backendservice.features.collection.entity;

import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COLLECTION_VISIT
 * Ghi nhận một lần thăm thu gom của Collector
 */
@Entity
@Table(name = "collection_visits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "visit_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID visitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Task task;

    /**
     * Collector thực hiện (User có role COLLECTOR)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User collectorUser;

    @Column(name = "visited_at")
    private LocalDateTime visitedAt;

    @Column(name = "visit_status", length = 30)
    @Builder.Default
    private String visitStatus = "VISITED"; // VISITED, FAILED, NO_SHOW, PARTIAL

    @Column(name = "collector_note", columnDefinition = "TEXT")
    private String collectorNote;

    // Helper methods
    public UUID getCollectorUserId() {
        return collectorUser != null ? collectorUser.getUserId() : null;
    }

    public UUID getTaskId() {
        return task != null ? task.getTaskId() : null;
    }
}
