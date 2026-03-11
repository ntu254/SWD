package com.example.backendservice.features.complaint.entity;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.reward.entity.RewardTransaction;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.waste.entity.WasteReport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "complaint_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID complaintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteReport wasteReport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CollectionVisit visit;

    @Column(length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private ComplaintCategory category = ComplaintCategory.OTHER; // BUG, FEATURE, POINTS_ERROR, OTHER

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private ComplaintPriority priority = ComplaintPriority.Normal; // Low, Normal, High, Urgent

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.Pending; // Pending, In_Progress, Resolved, Rejected

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_transaction_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RewardTransaction rewardTransaction;

    public UUID getCreatedByUserId() {
        return createdByUser != null ? createdByUser.getUserId() : null;
    }
}
