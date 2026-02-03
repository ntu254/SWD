package com.example.backendservice.features.user.entity;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng COLLECTOR
 * Hồ sơ Collector thuộc một Enterprise
 * Sử dụng composition thay vì inheritance
 */
@Entity
@Table(name = "collector_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    /**
     * Tham chiếu đến User - Composition pattern
     * Mỗi CollectorProfile liên kết với một User
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Enterprise enterprise;

    @Column(name = "availability_status", length = 20)
    @Builder.Default
    private String availabilityStatus = "AVAILABLE"; // AVAILABLE, BUSY, OFFLINE

    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;

    @Column(name = "max_load_kg")
    private Double maxLoadKg;

    @Column(name = "current_lat")
    private Double currentLat;

    @Column(name = "current_lng")
    private Double currentLng;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // Helper method to get userId
    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }

    // Helper method to get fullName (delegate to User)
    public String getFullName() {
        return user != null ? user.getFullName() : null;
    }

    // Helper method to get email (delegate to User)
    public String getEmail() {
        return user != null ? user.getEmail() : null;
    }
}
