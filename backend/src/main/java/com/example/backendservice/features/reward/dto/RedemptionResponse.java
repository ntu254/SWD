package com.example.backendservice.features.reward.dto;

import com.example.backendservice.features.reward.entity.RewardRedemption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class RedemptionResponse {

    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private UUID rewardItemId;
    private String rewardItemName;
    private Integer pointsUsed;
    private String status;
    private String rejectionReason;
    private LocalDateTime processedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RedemptionResponse() {
    }

    public RedemptionResponse(UUID id, UUID citizenId, String citizenName, UUID rewardItemId, String rewardItemName,
            Integer pointsUsed, String status, String rejectionReason, LocalDateTime processedAt,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.citizenId = citizenId;
        this.citizenName = citizenName;
        this.rewardItemId = rewardItemId;
        this.rewardItemName = rewardItemName;
        this.pointsUsed = pointsUsed;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.processedAt = processedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RedemptionResponseBuilder builder() {
        return new RedemptionResponseBuilder();
    }

    public static class RedemptionResponseBuilder {
        private UUID id;
        private UUID citizenId;
        private String citizenName;
        private UUID rewardItemId;
        private String rewardItemName;
        private Integer pointsUsed;
        private String status;
        private String rejectionReason;
        private LocalDateTime processedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RedemptionResponseBuilder() {
        }

        public RedemptionResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public RedemptionResponseBuilder citizenId(UUID citizenId) {
            this.citizenId = citizenId;
            return this;
        }

        public RedemptionResponseBuilder citizenName(String citizenName) {
            this.citizenName = citizenName;
            return this;
        }

        public RedemptionResponseBuilder rewardItemId(UUID rewardItemId) {
            this.rewardItemId = rewardItemId;
            return this;
        }

        public RedemptionResponseBuilder rewardItemName(String rewardItemName) {
            this.rewardItemName = rewardItemName;
            return this;
        }

        public RedemptionResponseBuilder pointsUsed(Integer pointsUsed) {
            this.pointsUsed = pointsUsed;
            return this;
        }

        public RedemptionResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public RedemptionResponseBuilder rejectionReason(String rejectionReason) {
            this.rejectionReason = rejectionReason;
            return this;
        }

        public RedemptionResponseBuilder processedAt(LocalDateTime processedAt) {
            this.processedAt = processedAt;
            return this;
        }

        public RedemptionResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RedemptionResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RedemptionResponse build() {
            return new RedemptionResponse(id, citizenId, citizenName, rewardItemId, rewardItemName, pointsUsed, status,
                    rejectionReason, processedAt, createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(UUID citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public void setCitizenName(String citizenName) {
        this.citizenName = citizenName;
    }

    public UUID getRewardItemId() {
        return rewardItemId;
    }

    public void setRewardItemId(UUID rewardItemId) {
        this.rewardItemId = rewardItemId;
    }

    public String getRewardItemName() {
        return rewardItemName;
    }

    public void setRewardItemName(String rewardItemName) {
        this.rewardItemName = rewardItemName;
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

    public static RedemptionResponse fromEntity(RewardRedemption entity) {
        return RedemptionResponse.builder()
                .id(entity.getId())
                .citizenId(entity.getCitizen().getId())
                .citizenName(entity.getCitizen().getUser() != null ? entity.getCitizen().getUser().getFullName() : null)
                .rewardItemId(entity.getRewardItem().getId())
                .rewardItemName(entity.getRewardItem().getName())
                .pointsUsed(entity.getPointsUsed())
                .status(entity.getStatus())
                .rejectionReason(entity.getRejectionReason())
                .processedAt(entity.getProcessedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
