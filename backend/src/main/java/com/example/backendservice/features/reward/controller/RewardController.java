package com.example.backendservice.features.reward.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.service.RewardRuleService;
import com.example.backendservice.features.reward.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller tá»•ng há»£p cho Reward System
 * - /rules: Admin cáº¥u hÃ¬nh Ä‘iá»ƒm thÆ°á»Ÿng theo loáº¡i rÃ¡c
 * - /transactions: Lá»‹ch sá»­ giao dá»‹ch Ä‘iá»ƒm
 * - /points: Truy váº¥n sá»‘ dÆ° Ä‘iá»ƒm
 */
@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards", description = "APIs for managing reward points, rules and transactions")
public class RewardController {

    private final RewardService rewardService;
    private final RewardRuleService rewardRuleService;

    // ==================== REWARD RULES (Admin Config) ====================

    @PostMapping("/rules")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Táº¡o quy táº¯c tÃ­nh Ä‘iá»ƒm má»›i", description = "Admin cáº¥u hÃ¬nh Ä‘iá»ƒm/kg cho tá»«ng loáº¡i rÃ¡c")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> createRule(
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Táº¡o quy táº¯c thÃ nh cÃ´ng", response));
    }

    @GetMapping("/rules/{id}")
    @Operation(summary = "Láº¥y thÃ´ng tin quy táº¯c theo ID")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleById(@PathVariable UUID id) {
        RewardRuleResponse response = rewardRuleService.getRuleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules/waste-type/{wasteTypeId}")
    @Operation(summary = "Láº¥y quy táº¯c theo loáº¡i rÃ¡c")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleByWasteType(
            @PathVariable UUID wasteTypeId) {
        RewardRuleResponse response = rewardRuleService.getRuleByWasteType(wasteTypeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules")
    @Operation(summary = "Láº¥y táº¥t cáº£ quy táº¯c")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getAllRules() {
        List<RewardRuleResponse> response = rewardRuleService.getAllRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules/active")
    @Operation(summary = "Láº¥y cÃ¡c quy táº¯c Ä‘ang hoáº¡t Ä‘á»™ng")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getActiveRules() {
        List<RewardRuleResponse> response = rewardRuleService.getActiveRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cáº­p nháº­t quy táº¯c")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.updateRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cáº­p nháº­t quy táº¯c thÃ nh cÃ´ng", response));
    }

    @PatchMapping("/rules/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "KÃ­ch hoáº¡t quy táº¯c")
    public ResponseEntity<ApiResponse<Void>> activateRule(@PathVariable UUID id) {
        rewardRuleService.activateRule(id);
        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ kÃ­ch hoáº¡t quy táº¯c", null));
    }

    @PatchMapping("/rules/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Táº¯t quy táº¯c")
    public ResponseEntity<ApiResponse<Void>> deactivateRule(@PathVariable UUID id) {
        rewardRuleService.deactivateRule(id);
        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ táº¯t quy táº¯c", null));
    }

    @DeleteMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "XÃ³a quy táº¯c")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        rewardRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("ÄÃ£ xÃ³a quy táº¯c", null));
    }

    @PostMapping("/rules/calculate")
    @Operation(summary = "TÃ­nh Ä‘iá»ƒm thÆ°á»Ÿng cho khá»‘i lÆ°á»£ng rÃ¡c")
    public ResponseEntity<ApiResponse<Integer>> calculatePoints(
            @RequestBody CalculatePointsRequest request) {
        Integer points = rewardRuleService.calculatePoints(request.getWasteTypeId(), request.getWeightKg());
        return ResponseEntity.ok(ApiResponse.success("TÃ­nh Ä‘iá»ƒm thÃ nh cÃ´ng", points));
    }

    // ==================== TRANSACTIONS (Lá»‹ch sá»­ giao dá»‹ch) ====================

    @PostMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Táº¡o giao dá»‹ch Ä‘iá»ƒm thÆ°á»Ÿng (manual)")
    public ResponseEntity<ApiResponse<RewardTransactionResponse>> createTransaction(
            @Valid @RequestBody CreateRewardTransactionRequest request) {
        RewardTransactionResponse response = rewardService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Giao dá»‹ch Ä‘Ã£ táº¡o thÃ nh cÃ´ng", response));
    }

    @GetMapping("/transactions/{transactionId}")
    @Operation(summary = "Láº¥y giao dá»‹ch theo ID")
    public ResponseEntity<ApiResponse<RewardTransactionResponse>> getTransactionById(
            @PathVariable UUID transactionId) {
        RewardTransactionResponse response = rewardService.getTransactionById(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions/citizen/{citizenUserId}")
    @Operation(summary = "Láº¥y giao dá»‹ch theo Citizen ID")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getTransactionsByCitizen(
            @PathVariable UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions/me")
    @Operation(summary = "Xem lá»‹ch sá»­ giao dá»‹ch Ä‘iá»ƒm cá»§a tÃ´i")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getMyTransactions(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Láº¥y táº¥t cáº£ giao dá»‹ch (Admin)")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getAllTransactions(Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== POINTS (Sá»‘ dÆ° Ä‘iá»ƒm) ====================

    @GetMapping("/points/{citizenUserId}")
    @Operation(summary = "Láº¥y sá»‘ Ä‘iá»ƒm cá»§a Citizen")
    public ResponseEntity<ApiResponse<Integer>> getCitizenPoints(@PathVariable UUID citizenUserId) {
        Integer points = rewardService.getCitizenPoints(citizenUserId);
        return ResponseEntity.ok(ApiResponse.success(points));
    }

    @GetMapping("/points/me")
    @Operation(summary = "Xem sá»‘ Ä‘iá»ƒm cá»§a tÃ´i")
    public ResponseEntity<ApiResponse<Integer>> getMyPoints(@RequestHeader("X-User-Id") UUID citizenUserId) {
        Integer points = rewardService.getCitizenPoints(citizenUserId);
        return ResponseEntity.ok(ApiResponse.success(points));
    }
    @GetMapping("/leaderboard")
    @Operation(summary = "Xem bảng xếp hạng điểm", description = "Lấy top citizen theo điểm, có thể lọc theo khu vực")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryResponse>>> getLeaderboard(
            @RequestParam(required = false) UUID areaId,
            @RequestParam(defaultValue = "20") int limit) {
        List<LeaderboardEntryResponse> leaderboard = rewardService.getLeaderboard(areaId, limit);
        return ResponseEntity.ok(ApiResponse.success(leaderboard));
    }
}
