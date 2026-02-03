package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRewardTransactionRequest {

    @NotNull(message = "Citizen User ID is required")
    private UUID citizenUserId;

    @NotBlank(message = "Transaction type is required")
    private String transactionType; // EARN, REDEEM

    @NotNull(message = "Points amount is required")
    @Positive(message = "Points amount must be positive")
    private Integer pointsAmount;

    private String description;
    private UUID referenceId;
}
