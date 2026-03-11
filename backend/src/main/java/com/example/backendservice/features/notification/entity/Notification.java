package com.example.backendservice.features.notification.entity;

import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID notificationId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private NotificationType type = NotificationType.General; // General, Maintenance, Update, Promotion, Alert

    @Enumerated(EnumType.STRING)
    @Column(name = "target_audience", length = 30)
    @Builder.Default
    private NotificationTargetAudience targetAudience = NotificationTargetAudience.All; // All, Citizen, Collector, Enterprise

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private NotificationPriority priority = NotificationPriority.Normal; // Low, Normal, High, Urgent

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public UUID getCreatedByUserId() {
        return createdBy != null ? createdBy.getUserId() : null;
    }
}
