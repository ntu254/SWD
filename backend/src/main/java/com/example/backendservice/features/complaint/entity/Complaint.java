package com.example.backendservice.features.complaint.entity;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.reward.entity.RewardTransaction;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.waste.entity.WasteReport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COMPLAINT
 * Đơn khiếu nại từ người dùng
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
    @Column(name = "complaint_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID complaintId;

    /**
     * Người tạo complaint
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdByUser;

    /**
     * Report liên quan (nếu có)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteReport wasteReport;

    /**
     * Visit liên quan (nếu có)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CollectionVisit visit;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 30)
    @Builder.Default
    private String status = "OPEN"; // OPEN, INVESTIGATING, RESOLVED, REJECTED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * RewardTransaction được tạo khi resolve complaint (bồi thường)
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_transaction_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private RewardTransaction rewardTransaction;

    // Helper methods
    public UUID getCreatedByUserId() {
        return createdByUser != null ? createdByUser.getUserId() : null;
    }
}
