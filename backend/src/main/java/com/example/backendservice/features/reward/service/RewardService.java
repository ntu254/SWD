package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service cho giao dịch điểm thưởng (Transactions & Points)
 * Quản lý việc cộng/trừ điểm và truy vấn số dư
 */
public interface RewardService {

    // Transactions
    RewardTransactionResponse createTransaction(CreateRewardTransactionRequest request);

    RewardTransactionResponse earnPoints(UUID citizenUserId, Integer points, String description, UUID referenceId);

    RewardTransactionResponse redeemPoints(UUID citizenUserId, Integer points, String description);

    RewardTransactionResponse getTransactionById(UUID transactionId);

    Page<RewardTransactionResponse> getTransactionsByCitizen(UUID citizenUserId, Pageable pageable);

    Page<RewardTransactionResponse> getAllTransactions(Pageable pageable);

    // Points
    Integer getCitizenPoints(UUID citizenUserId);
}
