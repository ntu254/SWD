package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardRuleServiceImpl implements RewardRuleService {

    private final CitizenRewardRuleRepository ruleRepository;
    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public RewardRuleResponse createRule(CreateRewardRuleRequest request) {
        log.info("Creating reward rule for waste type: {}", request.getWasteTypeId());

        WasteType wasteType = wasteTypeRepository.findById(request.getWasteTypeId())
                .orElseThrow(() -> new EntityNotFoundException("WasteType not found"));

        // Check if rule already exists for this waste type
        if (ruleRepository.findByWasteTypeId(request.getWasteTypeId()).isPresent()) {
            throw new IllegalArgumentException("Rule already exists for this waste type");
        }

        CitizenRewardRule rule = CitizenRewardRule.builder()
                .wasteType(wasteType)
                .pointsPerKg(request.getPointsPerKg())
                .bonusPercentage(request.getBonusPercentage() != null ? request.getBonusPercentage() : 0.0)
                .minWeightKg(request.getMinWeightKg() != null ? request.getMinWeightKg() : 0.0)
                .maxPointsPerDay(request.getMaxPointsPerDay())
                .description(request.getDescription())
                .validFrom(request.getValidFrom())
                .validUntil(request.getValidUntil())
                .status("ACTIVE")
                .build();

        rule = ruleRepository.save(rule);
        return mapToResponse(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public RewardRuleResponse getRuleById(UUID id) {
        CitizenRewardRule rule = findById(id);
        return mapToResponse(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public RewardRuleResponse getRuleByWasteType(UUID wasteTypeId) {
        CitizenRewardRule rule = ruleRepository.findByWasteTypeId(wasteTypeId)
                .orElseThrow(() -> new EntityNotFoundException("Rule not found for waste type"));
        return mapToResponse(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RewardRuleResponse> getAllRules() {
        return ruleRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RewardRuleResponse> getActiveRules() {
        return ruleRepository.findAllActiveRules(LocalDateTime.now()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RewardRuleResponse updateRule(UUID id, CreateRewardRuleRequest request) {
        CitizenRewardRule rule = findById(id);

        rule.setPointsPerKg(request.getPointsPerKg());
        if (request.getBonusPercentage() != null) {
            rule.setBonusPercentage(request.getBonusPercentage());
        }
        if (request.getMinWeightKg() != null) {
            rule.setMinWeightKg(request.getMinWeightKg());
        }
        rule.setMaxPointsPerDay(request.getMaxPointsPerDay());
        rule.setDescription(request.getDescription());
        rule.setValidFrom(request.getValidFrom());
        rule.setValidUntil(request.getValidUntil());

        rule = ruleRepository.save(rule);
        return mapToResponse(rule);
    }

    @Override
    @Transactional
    public void activateRule(UUID id) {
        CitizenRewardRule rule = findById(id);
        rule.setStatus("ACTIVE");
        ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public void deactivateRule(UUID id) {
        CitizenRewardRule rule = findById(id);
        rule.setStatus("INACTIVE");
        ruleRepository.save(rule);
    }

    @Override
    @Transactional
    public void deleteRule(UUID id) {
        CitizenRewardRule rule = findById(id);
        ruleRepository.delete(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer calculatePoints(UUID wasteTypeId, Double weightKg) {
        CitizenRewardRule rule = ruleRepository.findActiveRuleByWasteType(wasteTypeId, LocalDateTime.now())
                .orElse(null);

        if (rule == null) {
            // Fallback to waste type base points
            WasteType wasteType = wasteTypeRepository.findById(wasteTypeId).orElse(null);
            if (wasteType != null && wasteType.getBasePointsPerKg() != null) {
                return (int) Math.floor(weightKg * wasteType.getBasePointsPerKg());
            }
            return 0;
        }

        return rule.calculatePoints(weightKg);
    }

    private CitizenRewardRule findById(UUID id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RewardRule not found with id: " + id));
    }

    private RewardRuleResponse mapToResponse(CitizenRewardRule rule) {
        return RewardRuleResponse.builder()
                .id(rule.getId())
                .wasteTypeId(rule.getWasteType().getId())
                .wasteTypeName(rule.getWasteType().getName())
                .pointsPerKg(rule.getPointsPerKg())
                .bonusPercentage(rule.getBonusPercentage())
                .minWeightKg(rule.getMinWeightKg())
                .maxPointsPerDay(rule.getMaxPointsPerDay())
                .description(rule.getDescription())
                .status(rule.getStatus())
                .validFrom(rule.getValidFrom())
                .validUntil(rule.getValidUntil())
                .createdAt(rule.getCreatedAt())
                .build();
    }
}
