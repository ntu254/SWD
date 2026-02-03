package com.example.backendservice.features.task.entity;

import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng TASK_ASSIGNMENT
 * Gán nhiệm vụ cho Collector
 */
@Entity
@Table(name = "task_assignments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "assignment_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID assignmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Task task;

    /**
     * Collector được gán (User có role COLLECTOR)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User collectorUser;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "unassigned_at")
    private LocalDateTime unassignedAt;

    @Column(length = 30)
    @Builder.Default
    private String status = "ASSIGNED"; // ASSIGNED, ACCEPTED, REJECTED, COMPLETED, UNASSIGNED

    @Column(name = "collector_note", columnDefinition = "TEXT")
    private String collectorNote;

    // Helper method
    public UUID getCollectorUserId() {
        return collectorUser != null ? collectorUser.getUserId() : null;
    }

    public UUID getTaskId() {
        return task != null ? task.getTaskId() : null;
    }
}
