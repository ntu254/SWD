package com.example.backendservice.features.complaint.entity;

import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COMPLAINT_RESOLUTION
 * Kết quả xử lý khiếu nại bởi Admin
 */
@Entity
@Table(name = "complaint_resolutions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResolution {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "resolution_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID resolutionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Complaint complaint;

    /**
     * Admin xử lý complaint
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User adminUser;

    /**
     * Quyết định xử lý
     * COMPENSATE: Bồi thường
     * WARN_COLLECTOR: Cảnh cáo collector
     * NO_ACTION: Không có hành động
     * ESCALATE: Leo thang
     */
    @Column(length = 50)
    private String decision;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "is_accepted")
    private Boolean isAccepted;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Helper methods
    public UUID getComplaintId() {
        return complaint != null ? complaint.getComplaintId() : null;
    }

    public UUID getAdminUserId() {
        return adminUser != null ? adminUser.getUserId() : null;
    }
}
