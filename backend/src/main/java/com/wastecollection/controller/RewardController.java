package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.reward.*;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rewards")
@RequiredArgsConstructor
@Tag(name = "Rewards", description = "Citizen reward points and redemption")
public class RewardController {

    private final RewardService rewardService;
    private final SecurityUtils securityUtils;

    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    @Operation(summary = "Get current citizen's point balance")
    public ResponseEntity<ApiResponse<Integer>> getBalance() {
        return ResponseEntity.ok(ApiResponse.success(
                rewardService.getPointsBalance(securityUtils.getCurrentUserId())));
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    @Operation(summary = "Get reward transaction history for the authenticated citizen")
    public ResponseEntity<ApiResponse<PageResponse<RewardTransactionDto>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                rewardService.getMyTransactions(securityUtils.getCurrentUserId(), page, size)));
    }

    @GetMapping("/leaderboard")
    @Operation(summary = "Get top citizens leaderboard")
    public ResponseEntity<ApiResponse<List<LeaderboardEntryDto>>> getLeaderboard(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(rewardService.getLeaderboard(limit)));
    }

    @GetMapping("/items")
    @Operation(summary = "Get available reward items catalog")
    public ResponseEntity<ApiResponse<List<RewardItemDto>>> getItems() {
        return ResponseEntity.ok(ApiResponse.success(rewardService.getAvailableItems()));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasAnyRole('CITIZEN', 'ADMIN')")
    @Operation(summary = "Redeem a reward item with points")
    public ResponseEntity<ApiResponse<RewardTransactionDto>> redeem(
            @Valid @RequestBody RedeemItemRequest request) {
        RewardTransactionDto dto = rewardService.redeemItem(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Item redeemed successfully", dto));
    }
}
