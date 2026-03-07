package com.example.backendservice.features.reward.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
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
 * Quản lý quy tắc tính điểm thưởng cho Citizen theo loại rác
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RewardRuleServiceImpl implements RewardRuleService {

    private final CitizenRewardRuleRepository repository;
    private final com.example.backendservice.features.waste.repository.WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public RewardRuleResponse createRule(CreateRewardRuleRequest request) {
        log.info("Creating reward rule for waste type: {}", request.getWasteTypeId());

        // Lookup WasteType từ DB
        com.example.backendservice.features.waste.entity.WasteType wasteType = wasteTypeRepository.findByWasteTypeId(request.getWasteTypeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Waste type not found: " + request.getWasteTypeId()));

        CitizenRewardRule rule = CitizenRewardRule.builder()
                .wasteType(wasteType)
                .sortingLevel(request.getSortingLevel())
                .pointsFixed(request.getPointsFixed() != null ? request.getPointsFixed().doubleValue() : 0.0)
                .pointsPerKg(request.getPointsPerKg())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .isActive(true)
                .build();

        rule = repository.save(rule);
        log.info("Created reward rule {} for waste type {}", rule.getRuleId(), request.getWasteTypeId());

        return toResponse(rule);
    }

    @Override
    public RewardRuleResponse getRuleById(UUID id) {
        CitizenRewardRule rule = repository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));
        return toResponse(rule);
    }

    @Override
    public RewardRuleResponse getRuleByWasteType(UUID wasteTypeId) {
        // Just return the first active rule for this waste type
        CitizenRewardRule rule = repository.findActiveByWasteTypeId(wasteTypeId).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active reward rule for waste type: " + wasteTypeId));
        return toResponse(rule);
    }

    @Override
    public List<RewardRuleResponse> getAllRules() {
        return repository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<RewardRuleResponse> getActiveRules() {
        return repository.findAllActive().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RewardRuleResponse updateRule(UUID id, CreateRewardRuleRequest request) {
        log.info("Updating reward rule: {}", id);

        CitizenRewardRule rule = repository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));

        // Update WasteType nếu có
        if (request.getWasteTypeId() != null) {
            WasteType wasteType = wasteTypeRepository.findByWasteTypeId(request.getWasteTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Waste type not found: " + request.getWasteTypeId()));
            rule.setWasteType(wasteType);
        }
        rule.setSortingLevel(request.getSortingLevel());
        rule.setPointsFixed(request.getPointsFixed() != null ? request.getPointsFixed().doubleValue() : 0.0);
        rule.setPointsPerKg(request.getPointsPerKg());
        rule.setEffectiveFrom(request.getEffectiveFrom());
        rule.setEffectiveTo(request.getEffectiveTo());

        rule = repository.save(rule);
        log.info("Updated reward rule {}", id);

        return toResponse(rule);
    }

    @Override
    @Transactional
    public void activateRule(UUID id) {
        log.info("Activating reward rule: {}", id);
        CitizenRewardRule rule = repository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));
        rule.setIsActive(true);
        repository.save(rule);
        log.info("Activated reward rule {}", id);
    }

    @Override
    @Transactional
    public void deactivateRule(UUID id) {
        log.info("Deactivating reward rule: {}", id);
        CitizenRewardRule rule = repository.findByRuleId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + id));
        rule.setIsActive(false);
        repository.save(rule);
        log.info("Deactivated reward rule {}", id);
    }

    @Override
    @Transactional
    public void deleteRule(UUID id) {
        log.info("Deleting reward rule: {}", id);
        repository.deleteById(id);
        log.info("Deleted reward rule {}", id);
    }

    @Override
    public Integer calculatePoints(UUID wasteTypeId, Double weightKg) {
        log.debug("Calculating points for waste type {} with weight {} kg", wasteTypeId, weightKg);

        List<CitizenRewardRule> rules = repository.findActiveByWasteTypeId(wasteTypeId);
        if (rules.isEmpty()) {
            log.warn("No active rules found for waste type: {}", wasteTypeId);
            return 0;
        }

        // Lấy rule đầu tiên đang có hiệu lực
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
                .wasteTypeId(rule.getWasteType() != null ? rule.getWasteType().getWasteTypeId() : null)
                .wasteTypeName(rule.getWasteType() != null ? rule.getWasteType().getName() : null)
                .sortingLevel(rule.getSortingLevel())
                .pointsFixed(rule.getPointsFixed() != null ? rule.getPointsFixed().intValue() : null)
                .pointsPerKg(rule.getPointsPerKg())
                .isActive(rule.getIsActive())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .createdAt(null)
                .build();
    }
}
