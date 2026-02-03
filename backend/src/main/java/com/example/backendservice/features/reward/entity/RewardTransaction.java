package com.example.backendservice.features.reward.entity;

import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.complaint.entity.Complaint;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng REWARD_TRANSACTION
 * Giao dịch điểm thưởng cho Citizen
 */
@Entity
@Table(name = "reward_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "transaction_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID transactionId;

    /**
     * Citizen nhận điểm (User có role CITIZEN)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User citizenUser;

    /**
     * Visit liên quan (nếu có) - điểm cộng từ thu gom
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private CollectionVisit visit;

    /**
     * Complaint liên quan (nếu có) - điểm bồi thường
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Complaint complaint;

    /**
     * Số điểm thay đổi (có thể âm nếu trừ điểm)
     */
    @Column(name = "points_delta", nullable = false)
    private Double pointsDelta;

    /**
     * Mã lý do giao dịch
     * COLLECTION: Thu gom rác
     * BONUS: Thưởng thêm
     * PENALTY: Phạt
     * COMPENSATION: Bồi thường từ complaint
     * REDEMPTION: Đổi quà
     */
    @Column(name = "reason_code", length = 30)
    private String reasonCode;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    /**
     * Admin tạo giao dịch (nếu là manual adjustment)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdByAdmin;

    // Helper methods
    public UUID getCitizenUserId() {
        return citizenUser != null ? citizenUser.getUserId() : null;
    }
}
