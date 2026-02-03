package com.example.backendservice.features.reward.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.entity.CitizenRewardRule;
import com.example.backendservice.features.reward.entity.RewardTransaction;
import com.example.backendservice.features.reward.repository.CitizenRewardRuleRepository;
import com.example.backendservice.features.reward.repository.RewardTransactionRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardServiceImpl implements RewardService {

    private final RewardTransactionRepository transactionRepository;
    private final CitizenRewardRuleRepository rewardRuleRepository;
    private final UserRepository userRepository;
    private final WasteTypeRepository wasteTypeRepository;

    @Override
    @Transactional
    public RewardTransactionResponse createTransaction(CreateRewardTransactionRequest request) {
        User citizen = userRepository.findByUserId(request.getCitizenUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found: " + request.getCitizenUserId()));

        double pointsDelta = "EARN".equals(request.getTransactionType())
                ? request.getPointsAmount()
                : -request.getPointsAmount();

        RewardTransaction transaction = RewardTransaction.builder()
                .citizenUser(citizen)
                .pointsDelta(pointsDelta)
                .reasonCode(request.getTransactionType())
                .build();

        transaction = transactionRepository.save(transaction);

        log.info("Created {} transaction for citizen {}: {} points",
                request.getTransactionType(), request.getCitizenUserId(), request.getPointsAmount());

        return toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    public RewardTransactionResponse earnPoints(UUID citizenUserId, Integer points, String description,
            UUID referenceId) {
        CreateRewardTransactionRequest request = CreateRewardTransactionRequest.builder()
                .citizenUserId(citizenUserId)
                .transactionType("EARN")
                .pointsAmount(points)
                .description(description)
                .referenceId(referenceId)
                .build();
        return createTransaction(request);
    }

    @Override
    @Transactional
    public RewardTransactionResponse redeemPoints(UUID citizenUserId, Integer points, String description) {
        CreateRewardTransactionRequest request = CreateRewardTransactionRequest.builder()
                .citizenUserId(citizenUserId)
                .transactionType("REDEEM")
                .pointsAmount(points)
                .description(description)
                .build();
        return createTransaction(request);
    }

    @Override
    public RewardTransactionResponse getTransactionById(UUID transactionId) {
        RewardTransaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));
        return toTransactionResponse(transaction);
    }

    @Override
    public Page<RewardTransactionResponse> getTransactionsByCitizen(UUID citizenUserId, Pageable pageable) {
        List<RewardTransaction> transactions = transactionRepository.findByCitizenUserId(citizenUserId);
        List<RewardTransactionResponse> responses = transactions.stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<RewardTransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::toTransactionResponse);
    }

    @Override
    public Integer getCitizenPoints(UUID citizenUserId) {
        Double totalPoints = transactionRepository.sumPointsByCitizenUserId(citizenUserId);
        return totalPoints != null ? totalPoints.intValue() : 0;
    }

    // Reward Rules
    @Override
    @Transactional
    public RewardRuleResponse createRewardRule(CreateRewardRuleRequest request) {
        // Get default waste type (first active one)
        WasteType wasteType = wasteTypeRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No waste type found"));

        CitizenRewardRule rule = CitizenRewardRule.builder()
                .wasteType(wasteType)
                .sortingLevel(request.getSortingLevel())
                .pointsFixed(request.getPointsFixed() != null ? request.getPointsFixed().doubleValue() : null)
                .pointsPerKg(request.getMultiplier())
                .effectiveFrom(request.getEffectiveFrom())
                .effectiveTo(request.getEffectiveTo())
                .isActive(true)
                .build();

        rule = rewardRuleRepository.save(rule);
        log.info("Created reward rule for sorting level: {}", request.getSortingLevel());

        return toRuleResponse(rule);
    }

    @Override
    public RewardRuleResponse getRewardRuleById(UUID ruleId) {
        CitizenRewardRule rule = rewardRuleRepository.findByRuleId(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + ruleId));
        return toRuleResponse(rule);
    }

    @Override
    public List<RewardRuleResponse> getActiveRewardRules() {
        LocalDate today = LocalDate.now();
        return rewardRuleRepository.findEffectiveRules(today).stream()
                .map(this::toRuleResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RewardRuleResponse getRewardRuleBySortingLevel(String sortingLevel) {
        // Find first active rule with sorting level
        return rewardRuleRepository.findAllActive().stream()
                .filter(r -> sortingLevel.equals(r.getSortingLevel()))
                .findFirst()
                .map(this::toRuleResponse)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Active reward rule not found for sorting level: " + sortingLevel));
    }

    @Override
    public Page<RewardRuleResponse> getAllRewardRules(Pageable pageable) {
        return rewardRuleRepository.findAll(pageable).map(this::toRuleResponse);
    }

    @Override
    @Transactional
    public RewardRuleResponse updateRewardRule(UUID ruleId, CreateRewardRuleRequest request) {
        CitizenRewardRule rule = rewardRuleRepository.findByRuleId(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + ruleId));

        rule.setSortingLevel(request.getSortingLevel());
        rule.setPointsFixed(request.getPointsFixed() != null ? request.getPointsFixed().doubleValue() : null);
        rule.setPointsPerKg(request.getMultiplier());
        rule.setEffectiveFrom(request.getEffectiveFrom());
        rule.setEffectiveTo(request.getEffectiveTo());

        rule = rewardRuleRepository.save(rule);
        log.info("Updated reward rule: {}", ruleId);

        return toRuleResponse(rule);
    }

    @Override
    @Transactional
    public void deleteRewardRule(UUID ruleId) {
        CitizenRewardRule rule = rewardRuleRepository.findByRuleId(ruleId)
                .orElseThrow(() -> new ResourceNotFoundException("Reward rule not found: " + ruleId));
        rewardRuleRepository.delete(rule);
        log.info("Deleted reward rule: {}", ruleId);
    }

    @Override
    public Integer calculatePoints(String sortingLevel, Double quantityKg, Double basePointsPerKg) {
        int basePoints = (int) (quantityKg * basePointsPerKg);
        return basePoints;
    }

    // Mapping methods
    private RewardTransactionResponse toTransactionResponse(RewardTransaction transaction) {
        User citizen = transaction.getCitizenUser();
        return RewardTransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .citizenUserId(transaction.getCitizenUserId())
                .citizenName(citizen != null ? citizen.getFullName() : null)
                .transactionType(transaction.getReasonCode())
                .pointsAmount(transaction.getPointsDelta() != null ? transaction.getPointsDelta().intValue() : 0)
                .description(transaction.getReasonCode())
                .referenceId(null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    private RewardRuleResponse toRuleResponse(CitizenRewardRule rule) {
        return RewardRuleResponse.builder()
                .ruleId(rule.getRuleId())
                .sortingLevel(rule.getSortingLevel())
                .pointsFixed(rule.getPointsFixed() != null ? rule.getPointsFixed().intValue() : null)
                .multiplier(rule.getPointsPerKg())
                .effectiveFrom(rule.getEffectiveFrom())
                .effectiveTo(rule.getEffectiveTo())
                .createdAt(null)
                .build();
    }
}
