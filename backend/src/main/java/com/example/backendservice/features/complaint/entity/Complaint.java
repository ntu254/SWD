package com.example.backendservice.features.complaint.entity;

import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Đơn khiếu nại từ Citizen về Collector hoặc dịch vụ
 */
@Entity
@Table(name = "complaints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    // Optional: Collector being complained about
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_id")
    private CollectorProfile collector;

    // Optional: Related task assignment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_assignment_id")
    private TaskAssignment taskAssignment;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    @Builder.Default
    private String category = "OTHER";
    // LATE_ARRIVAL, RUDE_BEHAVIOR, INCOMPLETE_COLLECTION, DAMAGE, POINTS_ERROR,
    // BUG, SERVICE_ISSUE, OTHER

    @Column(name = "evidence_images", columnDefinition = "TEXT")
    private String evidenceImages; // JSON array of image URLs

    @Column(name = "status")
    @Builder.Default
    private String status = "PENDING"; // PENDING, INVESTIGATING, RESOLVED, REJECTED

    @Column(name = "priority")
    @Builder.Default
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
