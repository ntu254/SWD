package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface RewardService {

    // Transactions
    RewardTransactionResponse createTransaction(CreateRewardTransactionRequest request);

    RewardTransactionResponse earnPoints(UUID citizenUserId, Integer points, String description, UUID referenceId);

    RewardTransactionResponse redeemPoints(UUID citizenUserId, Integer points, String description);

    RewardTransactionResponse getTransactionById(UUID transactionId);

    Page<RewardTransactionResponse> getTransactionsByCitizen(UUID citizenUserId, Pageable pageable);

    Page<RewardTransactionResponse> getAllTransactions(Pageable pageable);

    Integer getCitizenPoints(UUID citizenUserId);

    // Rules
    RewardRuleResponse createRewardRule(CreateRewardRuleRequest request);

    RewardRuleResponse getRewardRuleById(UUID ruleId);

    List<RewardRuleResponse> getActiveRewardRules();

    RewardRuleResponse getRewardRuleBySortingLevel(String sortingLevel);

    Page<RewardRuleResponse> getAllRewardRules(Pageable pageable);

    RewardRuleResponse updateRewardRule(UUID ruleId, CreateRewardRuleRequest request);

    void deleteRewardRule(UUID ruleId);

    // Calculate points
    Integer calculatePoints(String sortingLevel, Double quantityKg, Double basePointsPerKg);
}
