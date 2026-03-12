package com.wastecollection.dto.reward;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class RewardTransactionDto {
    private UUID transactionId;
    private UUID citizenUserId;
    private Double pointsDelta;
    private String reasonCode;
    private UUID visitId;
    private LocalDateTime createdAt;
}
