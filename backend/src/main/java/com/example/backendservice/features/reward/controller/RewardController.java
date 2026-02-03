package com.example.backendservice.features.reward.controller;

import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
@Tag(name = "Reward", description = "APIs for managing rewards and points")
public class RewardController {

    private final RewardService rewardService;

    // Transaction endpoints
    @PostMapping("/transactions")
    @Operation(summary = "Create a reward transaction")
    public ResponseEntity<RewardTransactionResponse> createTransaction(
            @Valid @RequestBody CreateRewardTransactionRequest request) {
        RewardTransactionResponse response = rewardService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/transactions/{transactionId}")
    @Operation(summary = "Get transaction by ID")
    public ResponseEntity<RewardTransactionResponse> getTransactionById(@PathVariable UUID transactionId) {
        RewardTransactionResponse response = rewardService.getTransactionById(transactionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/citizen/{citizenUserId}")
    @Operation(summary = "Get transactions by citizen")
    public ResponseEntity<Page<RewardTransactionResponse>> getTransactionsByCitizen(
            @PathVariable UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions/me")
    @Operation(summary = "Get my transactions")
    public ResponseEntity<Page<RewardTransactionResponse>> getMyTransactions(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get all transactions")
    public ResponseEntity<Page<RewardTransactionResponse>> getAllTransactions(Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getAllTransactions(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/points/{citizenUserId}")
    @Operation(summary = "Get citizen points")
    public ResponseEntity<Integer> getCitizenPoints(@PathVariable UUID citizenUserId) {
        Integer points = rewardService.getCitizenPoints(citizenUserId);
        return ResponseEntity.ok(points);
    }

    @GetMapping("/points/me")
    @Operation(summary = "Get my points")
    public ResponseEntity<Integer> getMyPoints(@RequestHeader("X-User-Id") UUID citizenUserId) {
        Integer points = rewardService.getCitizenPoints(citizenUserId);
        return ResponseEntity.ok(points);
    }

    // Reward Rules endpoints
    @PostMapping("/rules")
    @Operation(summary = "Create a reward rule")
    public ResponseEntity<RewardRuleResponse> createRewardRule(
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardService.createRewardRule(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/rules/{ruleId}")
    @Operation(summary = "Get reward rule by ID")
    public ResponseEntity<RewardRuleResponse> getRewardRuleById(@PathVariable UUID ruleId) {
        RewardRuleResponse response = rewardService.getRewardRuleById(ruleId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rules/active")
    @Operation(summary = "Get all active reward rules")
    public ResponseEntity<List<RewardRuleResponse>> getActiveRewardRules() {
        List<RewardRuleResponse> response = rewardService.getActiveRewardRules();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rules/sorting-level/{sortingLevel}")
    @Operation(summary = "Get reward rule by sorting level")
    public ResponseEntity<RewardRuleResponse> getRewardRuleBySortingLevel(@PathVariable String sortingLevel) {
        RewardRuleResponse response = rewardService.getRewardRuleBySortingLevel(sortingLevel);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rules")
    @Operation(summary = "Get all reward rules")
    public ResponseEntity<Page<RewardRuleResponse>> getAllRewardRules(Pageable pageable) {
        Page<RewardRuleResponse> response = rewardService.getAllRewardRules(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/rules/{ruleId}")
    @Operation(summary = "Update reward rule")
    public ResponseEntity<RewardRuleResponse> updateRewardRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardService.updateRewardRule(ruleId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/rules/{ruleId}")
    @Operation(summary = "Delete reward rule")
    public ResponseEntity<Void> deleteRewardRule(@PathVariable UUID ruleId) {
        rewardService.deleteRewardRule(ruleId);
        return ResponseEntity.noContent().build();
    }
}
