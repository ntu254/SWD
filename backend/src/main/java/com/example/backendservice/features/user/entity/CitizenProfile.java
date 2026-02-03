package com.example.backendservice.features.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng CITIZEN
 * Hồ sơ Citizen - sử dụng composition thay vì inheritance
 */
@Entity
@Table(name = "citizen_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    /**
     * Tham chiếu đến User - Composition pattern
     * Mỗi CitizenProfile liên kết với một User
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "current_points")
    @Builder.Default
    private Integer currentPoints = 0;

    @Column(name = "membership_tier", length = 20)
    @Builder.Default
    private String membershipTier = "Bronze"; // Bronze, Silver, Gold

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
