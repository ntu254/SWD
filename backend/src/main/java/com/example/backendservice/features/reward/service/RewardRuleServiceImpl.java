package com.example.backendservice.features.reward.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of RewardRuleService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RewardRuleServiceImpl implements RewardRuleService {

    private final CitizenRewardRuleRepository ruleRepository;

    @Override
    @Transactional
    public RewardRuleResponse createRule(CreateRewardRuleRequest request) {
        log.info("Creating reward rule with sorting level: {}", request.getSortingLevel());

        CitizenRewardRule rule = CitizenRewardRule.builder()
                .sortingLevel(request.getSortingLevel())
                .pointsFixed(request.getPointsFixed() != null ? request.getPointsFixed().doubleValue() : null)
                .pointsPerKg(request.getMultiplier())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .isActive(true)
                .build();

        rule = ruleRepository.save(rule);
        log.info("Reward rule created: {}", rule.getRuleId());

        return toResponse(rule);
    }

    @Override
    public RewardRuleResponse getRuleById(UUID id) {
        CitizenRewardRule rule = ruleRepository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));
        return toResponse(rule);
    }

    @Override
    public RewardRuleResponse getRuleByWasteType(UUID wasteTypeId) {
        List<CitizenRewardRule> rules = ruleRepository.findActiveByWasteTypeId(wasteTypeId);
        if (rules.isEmpty()) {
            throw new ResourceNotFoundException("No active rules found for waste type: " + wasteTypeId);
        }
        return toResponse(rules.get(0));
    }

    @Override
    public List<RewardRuleResponse> getAllRules() {
        return ruleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RewardRuleResponse> getActiveRules() {
        return ruleRepository.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RewardRuleResponse updateRule(UUID id, CreateRewardRuleRequest request) {
        log.info("Updating reward rule: {}", id);

        CitizenRewardRule rule = ruleRepository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));

        if (request.getSortingLevel() != null) {
            rule.setSortingLevel(request.getSortingLevel());
        }
        if (request.getPointsFixed() != null) {
            rule.setPointsFixed(request.getPointsFixed().doubleValue());
        }
        if (request.getMultiplier() != null) {
            rule.setPointsPerKg(request.getMultiplier());
        }
        if (request.getEffectiveFrom() != null) {
            rule.setEffectiveFrom(request.getEffectiveFrom());
        }
        if (request.getEffectiveTo() != null) {
            rule.setEffectiveTo(request.getEffectiveTo());
        }

        rule = ruleRepository.save(rule);
        log.info("Reward rule updated: {}", id);

        return toResponse(rule);
    }

    @Override
    @Transactional
    public void activateRule(UUID id) {
        log.info("Activating reward rule: {}", id);

        CitizenRewardRule rule = ruleRepository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));

        rule.setIsActive(true);
        ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public void deactivateRule(UUID id) {
        log.info("Deactivating reward rule: {}", id);

        CitizenRewardRule rule = ruleRepository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));

        rule.setIsActive(false);
        ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public void deleteRule(UUID id) {
        log.info("Deleting reward rule: {}", id);

        CitizenRewardRule rule = ruleRepository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));

        ruleRepository.delete(rule);
    }

    @Override
    public Integer calculatePoints(UUID wasteTypeId, Double weightKg) {
        log.debug("Calculating points for waste type {} with weight {} kg", wasteTypeId, weightKg);

        List<CitizenRewardRule> rules = ruleRepository.findActiveByWasteTypeId(wasteTypeId);
        if (rules.isEmpty()) {
            log.warn("No active rules found for waste type: {}", wasteTypeId);
            return 0;
        }

        // Use the first effective rule
        CitizenRewardRule rule = rules.stream()
                .filter(r -> r.isEffective(LocalDate.now()))
                .findFirst()
                .orElse(rules.get(0));

        double points = rule.calculatePoints(weightKg);
        return (int) Math.round(points);
    }

    private RewardRuleResponse toResponse(CitizenRewardRule rule) {
        return RewardRuleResponse.builder()
                .ruleId(rule.getRuleId())
                .sortingLevel(rule.getSortingLevel())
                .pointsFixed(rule.getPointsFixed() != null ? rule.getPointsFixed().intValue() : null)
                .multiplier(rule.getPointsPerKg())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .createdAt(null) // Not tracked in entity
                .build();
    }
}
