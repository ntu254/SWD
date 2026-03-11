package com.example.backendservice.features.user.entity;

import com.example.backendservice.features.location.entity.ServiceArea;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng CITIZEN
 * Hồ sơ Citizen - sử dụng user_id làm PK (shared PK với User)
 */
@Entity
@Table(name = "citizens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenProfile {

    @Id
    @Column(name = "user_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_area_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private ServiceArea defaultArea;

    @Column(name = "address_text", length = 500)
    private String addressText;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "points")
    @Builder.Default
    private Integer points = 0;

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

    public void addPoints(int delta) {
        this.points = (this.points == null ? 0 : this.points) + delta;
    }
}
