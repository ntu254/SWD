package com.example.backendservice.features.reward.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.reward.dto.CalculatePointsRequest;
import com.example.backendservice.features.reward.dto.CreateRewardRuleRequest;
import com.example.backendservice.features.reward.dto.RewardRuleResponse;
import com.example.backendservice.features.reward.service.RewardRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reward-rules")
@RequiredArgsConstructor
@Tag(name = "Reward Rules", description = "APIs quản lý quy tắc tính điểm thưởng")
public class RewardRuleController {

    private final RewardRuleService rewardRuleService;

    @PostMapping
    @Operation(summary = "Tạo quy tắc tính điểm mới")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> createRule(
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.createRule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo quy tắc thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin quy tắc theo ID")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleById(@PathVariable UUID id) {
        RewardRuleResponse response = rewardRuleService.getRuleById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/waste-type/{wasteTypeId}")
    @Operation(summary = "Lấy quy tắc theo loại rác")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> getRuleByWasteType(
            @PathVariable UUID wasteTypeId) {
        RewardRuleResponse response = rewardRuleService.getRuleByWasteType(wasteTypeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Lấy tất cả quy tắc")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getAllRules() {
        List<RewardRuleResponse> response = rewardRuleService.getAllRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy các quy tắc đang hoạt động")
    public ResponseEntity<ApiResponse<List<RewardRuleResponse>>> getActiveRules() {
        List<RewardRuleResponse> response = rewardRuleService.getActiveRules();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật quy tắc")
    public ResponseEntity<ApiResponse<RewardRuleResponse>> updateRule(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRewardRuleRequest request) {
        RewardRuleResponse response = rewardRuleService.updateRule(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Kích hoạt quy tắc")
    public ResponseEntity<ApiResponse<Void>> activateRule(@PathVariable UUID id) {
        rewardRuleService.activateRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt quy tắc", null));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Tắt quy tắc")
    public ResponseEntity<ApiResponse<Void>> deactivateRule(@PathVariable UUID id) {
        rewardRuleService.deactivateRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã tắt quy tắc", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa quy tắc")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable UUID id) {
        rewardRuleService.deleteRule(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa quy tắc", null));
    }

    @PostMapping("/calculate")
    @Operation(summary = "Tính điểm thưởng cho khối lượng rác")
    public ResponseEntity<ApiResponse<Integer>> calculatePoints(
            @RequestBody CalculatePointsRequest request) {
        Integer points = rewardRuleService.calculatePoints(request.getWasteTypeId(), request.getWeightKg());
        return ResponseEntity.ok(ApiResponse.success("Tính điểm thành công", points));
    }
}
