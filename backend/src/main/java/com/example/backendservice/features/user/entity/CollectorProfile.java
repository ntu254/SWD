package com.example.backendservice.features.user.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COLLECTOR
 * Hồ sơ Collector thuộc một Enterprise (User với role ENTERPRISE)
 * Sử dụng user_id làm PK (shared PK với User)
 */
@Entity
@Table(name = "collectors")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorProfile {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    /**
     * FK đến User có role = ENTERPRISE
     * Doanh nghiệp quản lý collector này
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User enterpriseUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_area_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea defaultArea;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, SUSPENDED

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public String getFullName() {
        return user != null ? user.getFullName() : null;
    }

    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }

    public UUID getEnterpriseUserId() {
        return enterpriseUser != null ? enterpriseUser.getUserId() : null;
    }
}
