package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;

import java.util.List;
import java.util.UUID;

public interface RewardRuleService {

    RewardRuleResponse createRule(CreateRewardRuleRequest request);

    RewardRuleResponse getRuleById(UUID id);

    RewardRuleResponse getRuleByWasteType(UUID wasteTypeId);

    List<RewardRuleResponse> getAllRules();

    List<RewardRuleResponse> getActiveRules();

    RewardRuleResponse updateRule(UUID id, CreateRewardRuleRequest request);

    void activateRule(UUID id);

    void deactivateRule(UUID id);

    void deleteRule(UUID id);

    // Points calculation
    Integer calculatePoints(UUID wasteTypeId, Double weightKg);
}
