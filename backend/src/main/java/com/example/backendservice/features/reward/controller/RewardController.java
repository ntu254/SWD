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
 * Controller cho Reward System
 * - /rules: Admin tao, sua, xoa, kich hoat, tat
 * - /transactions: Citizen tao, sua, xoa, 
 * - /points: Citizen lay
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
    @Operation(summary = "Tạo quy tắc tính điểm mới", description = "Admin cấu hình điểm/kg cho từng loại rác")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> createRule(
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo quy tắc thành công", response));
    }

    @GetMapping("/rules/{id}")
    @Operation(summary = "Lấy thông tin quy tắc theo ID")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleById(@PathVariable UUID id) {
        RewardRuleResponse response = rewardRuleService.getRuleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules/waste-type/{wasteTypeId}")
    @Operation(summary = "Lấy quy tắc theo loại rác")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleByWasteType(
            @PathVariable UUID wasteTypeId) {
        RewardRuleResponse response = rewardRuleService.getRuleByWasteType(wasteTypeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules")
    @Operation(summary = "Lấy tất cả quy tắc")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getAllRules() {
        List<RewardRuleResponse> response = rewardRuleService.getAllRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/rules/active")
    @Operation(summary = "Lấy quy tắc đang hoạt động")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getActiveRules() {
        List<RewardRuleResponse> response = rewardRuleService.getActiveRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "cập nhật quy tắc ")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.updateRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật quy tắc thành công", response));
    }

    @PatchMapping("/rules/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kích hoạt quy tắc")
    public ResponseEntity<ApiResponse<Void>> activateRule(@PathVariable UUID id) {
        rewardRuleService.activateRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt quy tắc", null));
    }

    @PatchMapping("/rules/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tắt quy tắc")
    public ResponseEntity<ApiResponse<Void>> deactivateRule(@PathVariable UUID id) {
        rewardRuleService.deactivateRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã tắt quy tắc", null));
    }

    @DeleteMapping("/rules/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa quy tắc")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        rewardRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa quy tắc", null));
    }

    @PostMapping("/rules/calculate")
    @Operation(summary = "Tính điểm thưởng cho khối lượng rác")
    public ResponseEntity<ApiResponse<Integer>> calculatePoints(
            @RequestBody CalculatePointsRequest request) {
        Integer points = rewardRuleService.calculatePoints(request.getWasteTypeId(), request.getWeightKg());
        return ResponseEntity.ok(ApiResponse.success("Tính điểm thành công", points));
    }

    // ==================== TRANSACTIONS (Lá»‹ch sá»­ giao dá»‹ch) ====================

    @PostMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo giao dịch điểm thưởng (manual)")
    public ResponseEntity<ApiResponse<RewardTransactionResponse>> createTransaction(
            @Valid @RequestBody CreateRewardTransactionRequest request) {
        RewardTransactionResponse response = rewardService.createTransaction(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Giao dịch đã tạo thành công", response));
    }

    @GetMapping("/transactions/{transactionId}")
    @Operation(summary = "Lấy giao dịch theo ID")
    public ResponseEntity<ApiResponse<RewardTransactionResponse>> getTransactionById(
            @PathVariable UUID transactionId) {
        RewardTransactionResponse response = rewardService.getTransactionById(transactionId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions/citizen/{citizenUserId}")
    @Operation(summary = "Lấy giao dịch theo Citizen ID")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getTransactionsByCitizen(
            @PathVariable UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions/me")
    @Operation(summary = "Xem lịch sử giao dịch điểm của tôi")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getMyTransactions(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getTransactionsByCitizen(citizenUserId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy tất cả giao dịch (Admin)")
    public ResponseEntity<ApiResponse<Page<RewardTransactionResponse>>> getAllTransactions(Pageable pageable) {
        Page<RewardTransactionResponse> response = rewardService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== POINTS (Sá»‘ dÆ° Ä‘iá»ƒm) ====================

    @GetMapping("/points/{citizenUserId}")
    @Operation(summary = "Lấy số điểm của Citizen")
    public ResponseEntity<ApiResponse<Integer>> getCitizenPoints(@PathVariable UUID citizenUserId) {
        Integer points = rewardService.getCitizenPoints(citizenUserId);
        return ResponseEntity.ok(ApiResponse.success(points));
    }

    @GetMapping("/points/me")
    @Operation(summary = "Xem số điểm của tôi")
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
