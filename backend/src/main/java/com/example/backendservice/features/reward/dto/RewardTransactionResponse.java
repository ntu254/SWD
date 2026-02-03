package com.example.backendservice.features.reward.dto;

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
public class RewardTransactionResponse {
    private UUID transactionId;
    private UUID citizenUserId;
    private String citizenName;
    private String transactionType; // EARN, REDEEM
    private Integer pointsAmount;
    private String description;
    private UUID referenceId;
    private LocalDateTime createdAt;
}
