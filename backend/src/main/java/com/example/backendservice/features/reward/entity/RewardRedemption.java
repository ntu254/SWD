package com.example.backendservice.features.reward.entity;

import com.example.backendservice.features.user.entity.Citizen;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reward_redemptions")
@Entity
@Table(name = "reward_redemptions")
public class RewardRedemption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reward_item_id", nullable = false)
    private RewardItem rewardItem;

    @Column(name = "points_used", nullable = false)
    private Integer pointsUsed;

    @Column(name = "status")
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public RewardRedemption() {
    }

    public RewardRedemption(UUID id, Citizen citizen, RewardItem rewardItem, Integer pointsUsed, String status,
            String rejectionReason, LocalDateTime processedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.citizen = citizen;
        this.rewardItem = rewardItem;
        this.pointsUsed = pointsUsed;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.processedAt = processedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RewardRedemptionBuilder builder() {
        return new RewardRedemptionBuilder();
    }

    public static class RewardRedemptionBuilder {
        private UUID id;
        private Citizen citizen;
        private RewardItem rewardItem;
        private Integer pointsUsed;
        private String status = "PENDING";
        private String rejectionReason;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RewardRedemptionBuilder() {
        }

        public RewardRedemptionBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public RewardRedemptionBuilder citizen(Citizen citizen) {
            this.citizen = citizen;
            return this;
        }

        public RewardRedemptionBuilder rewardItem(RewardItem rewardItem) {
            this.rewardItem = rewardItem;
            return this;
        }

        public RewardRedemptionBuilder pointsUsed(Integer pointsUsed) {
            this.pointsUsed = pointsUsed;
            return this;
        }

        public RewardRedemptionBuilder status(String status) {
            this.status = status;
            return this;
        }

        public RewardRedemptionBuilder rejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
            return this;
        }

        public RewardRedemptionBuilder processedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
            return this;
        }

        public RewardRedemptionBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RewardRedemptionBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RewardRedemption build() {
            return new RewardRedemption(id, citizen, rewardItem, pointsUsed, status, rejectionReason, processedAt,
                    createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Citizen getCitizen() {
        return citizen;
    }

    public void setCitizen(Citizen citizen) {
        this.citizen = citizen;
    }

    public RewardItem getRewardItem() {
        return rewardItem;
    }

    public void setRewardItem(RewardItem rewardItem) {
        this.rewardItem = rewardItem;
    }

    public Integer getPointsUsed() {
        return pointsUsed;
    }

    public void setPointsUsed(Integer pointsUsed) {
        this.pointsUsed = pointsUsed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
