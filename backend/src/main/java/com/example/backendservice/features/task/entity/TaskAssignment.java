package com.example.backendservice.features.task.entity;

import com.example.backendservice.features.user.entity.CollectorProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Gán nhiệm vụ cho Collector (Task Assignment)
 * Theo dõi ai được gán, trạng thái hoàn thành
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
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_id", nullable = false)
    private CollectorProfile collector;

    @Column(length = 50)
    @Builder.Default
    private String status = "ASSIGNED"; // ASSIGNED, ACCEPTED, REJECTED, IN_PROGRESS, COMPLETED, FAILED

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "evidence_images", columnDefinition = "TEXT")
    private String evidenceImages; // JSON array of image URLs

    @Column(name = "collected_weight_kg")
    private Double collectedWeightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
