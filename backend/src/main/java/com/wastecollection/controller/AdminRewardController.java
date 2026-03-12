package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.reward.RewardItemDto;
import com.wastecollection.service.RewardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/reward-items")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - Reward Items", description = "Manage reward catalog items")
public class AdminRewardController {

    private final RewardService rewardService;

    @GetMapping
    @Operation(summary = "List all reward items (including inactive)")
    public ResponseEntity<ApiResponse<PageResponse<RewardItemDto>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(rewardService.getAllItems(page, size)));
    }

    @PostMapping
    @Operation(summary = "Create a new reward item")
    public ResponseEntity<ApiResponse<RewardItemDto>> create(@Valid @RequestBody RewardItemDto request) {
        RewardItemDto dto = rewardService.createItem(request);
        return ResponseEntity.status(201).body(ApiResponse.success("Reward item created", dto));
    }

    @PutMapping("/{itemId}")
    @Operation(summary = "Update a reward item")
    public ResponseEntity<ApiResponse<RewardItemDto>> update(
            @PathVariable UUID itemId,
            @Valid @RequestBody RewardItemDto request) {
        RewardItemDto dto = rewardService.updateItem(itemId, request);
        return ResponseEntity.ok(ApiResponse.success("Reward item updated", dto));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Deactivate a reward item")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID itemId) {
        rewardService.deactivateItem(itemId);
        return ResponseEntity.ok(ApiResponse.success("Reward item deactivated", null));
    }
}
