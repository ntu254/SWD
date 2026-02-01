package com.example.backendservice.features.reward.dto;

import com.example.backendservice.features.reward.entity.RewardRedemption;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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

    public static RedemptionResponse fromEntity(RewardRedemption entity) {
        return RedemptionResponse.builder()
                .id(entity.getId())
                .citizenId(entity.getCitizen().getId())
                .citizenName(entity.getCitizen() != null ? entity.getCitizen().getFullName() : null)
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
