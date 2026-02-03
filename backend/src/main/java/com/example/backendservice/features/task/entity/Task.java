package com.example.backendservice.features.task.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.waste.entity.WasteReport;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng TASK
 * Nhiệm vụ thu gom rác - được tạo từ WasteReport
 */
@Entity
@Table(name = "tasks")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "task_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID taskId;

    /**
     * Enterprise xử lý task (User có role ENTERPRISE)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User enterpriseUser;

    /**
     * Người tạo task (Admin hoặc Enterprise)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User createdByUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea area;

    /**
     * Source: Waste Report
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private WasteReport wasteReport;

    @Column(name = "scheduled_date")
    private LocalDate scheduledDate;

    @Column(length = 20)
    @Builder.Default
    private String priority = "NORMAL"; // LOW, NORMAL, HIGH, URGENT

    @Column(length = 30)
    @Builder.Default
    private String status = "PENDING"; // PENDING, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public UUID getEnterpriseUserId() {
        return enterpriseUser != null ? enterpriseUser.getUserId() : null;
    }

    public UUID getReportId() {
        return wasteReport != null ? wasteReport.getReportId() : null;
    }
}
