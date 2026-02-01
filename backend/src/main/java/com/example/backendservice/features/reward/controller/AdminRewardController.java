package com.example.backendservice.features.reward.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.common.dto.PageResponse;
import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rewards/admin")
@RequiredArgsConstructor
@Tag(name = "Reward Management", description = "APIs for managing reward items and redemption requests (Admin only)")
public class AdminRewardController {

    private final RewardService rewardService;

    // ===================== REWARD ITEM ENDPOINTS =====================

    @Operation(summary = "Get all reward items", description = "Admin retrieves all reward items with optional filters")
    @GetMapping("/items")
    public ResponseEntity<ApiResponse<PageResponse<RewardItemResponse>>> getAllRewardItems(
            @Parameter(description = "Filter by status (ACTIVE, INACTIVE)") @RequestParam(required = false) String status,
            @Parameter(description = "Search by name") @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<RewardItemResponse> items = rewardService.getAllRewardItems(status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(items)));
    }

    @Operation(summary = "Get reward item by ID", description = "Retrieves detailed information about a specific reward item")
    @GetMapping("/items/{id}")
    public ResponseEntity<ApiResponse<RewardItemResponse>> getRewardItemById(
            @Parameter(description = "ID of the reward item") @PathVariable UUID id) {
        RewardItemResponse response = rewardService.getRewardItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Create new reward item", description = "Admin creates a new reward item")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Reward item created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request")
    })
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<RewardItemResponse>> createRewardItem(
            @Valid @RequestBody CreateRewardItemRequest request) {

        RewardItemResponse response = rewardService.createRewardItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Reward item created successfully", response));
    }

    @Operation(summary = "Update reward item", description = "Admin updates an existing reward item")
    @PutMapping("/items/{id}")
    public ResponseEntity<ApiResponse<RewardItemResponse>> updateRewardItem(
            @Parameter(description = "ID of the reward item") @PathVariable UUID id,
            @Valid @RequestBody UpdateRewardItemRequest request) {

        RewardItemResponse response = rewardService.updateRewardItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Reward item updated successfully", response));
    }

    @Operation(summary = "Delete reward item", description = "Admin deletes a reward item from the system")
    @DeleteMapping("/items/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRewardItem(
            @Parameter(description = "ID of the reward item") @PathVariable UUID id) {
        rewardService.deleteRewardItem(id);
        return ResponseEntity.ok(ApiResponse.success("Reward item deleted successfully", null));
    }

    // ===================== REDEMPTION ENDPOINTS =====================

    @Operation(summary = "Get all redemptions", description = "Admin retrieves all redemption requests with optional status filter")
    @GetMapping("/redemptions")
    public ResponseEntity<ApiResponse<PageResponse<RedemptionResponse>>> getAllRedemptions(
            @Parameter(description = "Filter by status (PENDING, APPROVED, REJECTED)") @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<RedemptionResponse> redemptions = rewardService.getAllRedemptions(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(PageResponse.of(redemptions)));
    }

    @Operation(summary = "Get redemption by ID", description = "Retrieves detailed information about a specific redemption")
    @GetMapping("/redemptions/{id}")
    public ResponseEntity<ApiResponse<RedemptionResponse>> getRedemptionById(
            @Parameter(description = "ID of the redemption") @PathVariable UUID id) {
        RedemptionResponse response = rewardService.getRedemptionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Approve redemption", description = "Admin approves a pending redemption request. Stock will be deducted.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Redemption approved successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Redemption is not in PENDING status or out of stock"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Redemption not found")
    })
    @PatchMapping("/redemptions/{id}/approve")
    public ResponseEntity<ApiResponse<RedemptionResponse>> approveRedemption(
            @Parameter(description = "ID of the redemption") @PathVariable UUID id) {

        RedemptionResponse response = rewardService.approveRedemption(id);
        return ResponseEntity.ok(ApiResponse.success("Redemption approved successfully", response));
    }

    @Operation(summary = "Reject redemption", description = "Admin rejects a pending redemption request. Points will be refunded to citizen.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Redemption rejected successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Redemption is not in PENDING status"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Redemption not found")
    })
    @PatchMapping("/redemptions/{id}/reject")
    public ResponseEntity<ApiResponse<RedemptionResponse>> rejectRedemption(
            @Parameter(description = "ID of the redemption") @PathVariable UUID id,
            @RequestBody(required = false) RejectRedemptionRequest request) {

        RedemptionResponse response = rewardService.rejectRedemption(id,
                request != null ? request : new RejectRedemptionRequest());
        return ResponseEntity.ok(ApiResponse.success("Redemption rejected successfully", response));
    }
}
