package com.example.backendservice.features.reward.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity cho bảng REWARD_ITEMS
 * Danh mục phần thưởng để Citizen đổi bằng điểm (Points)
 */
@Entity
@Table(name = "reward_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id", columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID itemId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
