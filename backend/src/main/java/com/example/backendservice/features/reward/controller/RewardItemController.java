package com.example.backendservice.features.reward.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.reward.dto.CreateRewardItemRequest;
import com.example.backendservice.features.reward.dto.RedeemRequest;
import com.example.backendservice.features.reward.dto.RewardItemResponse;
import com.example.backendservice.features.reward.service.RewardItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reward-items")
@RequiredArgsConstructor
@Tag(name = "Reward Items", description = "APIs for managing reward catalog and redemption")
public class RewardItemController {

    private final RewardItemService rewardItemService;

    // ==================== ADMIN OPERATIONS ====================

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo phần thưởng mới", description = "Admin thêm phần thưởng vào catalog")
    public ResponseEntity<ApiResponse<RewardItemResponse>> createItem(
            @Valid @RequestBody CreateRewardItemRequest request) {
        RewardItemResponse response = rewardItemService.createItem(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phần thưởng thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật phần thưởng", description = "Admin sửa thông tin phần thưởng")
    public ResponseEntity<ApiResponse<RewardItemResponse>> updateItem(
            @PathVariable UUID id,
            @Valid @RequestBody CreateRewardItemRequest request) {
        RewardItemResponse response = rewardItemService.updateItem(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phần thưởng thành công", response));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Kích hoạt phần thưởng")
    public ResponseEntity<ApiResponse<Void>> activateItem(@PathVariable UUID id) {
        rewardItemService.activateItem(id);
        return ResponseEntity.ok(ApiResponse.success("Đã kích hoạt phần thưởng", null));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạm ngưng phần thưởng")
    public ResponseEntity<ApiResponse<Void>> deactivateItem(@PathVariable UUID id) {
        rewardItemService.deactivateItem(id);
        return ResponseEntity.ok(ApiResponse.success("Đã tạm ngưng phần thưởng", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa phần thưởng")
    public ResponseEntity<ApiResponse<Void>> deleteItem(@PathVariable UUID id) {
        rewardItemService.deleteItem(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa phần thưởng", null));
    }

    // ==================== PUBLIC/CITIZEN OPERATIONS ====================

    @GetMapping
    @Operation(summary = "Lấy tất cả phần thưởng (Admin/Public)")
    public ResponseEntity<ApiResponse<List<RewardItemResponse>>> getAllItems() {
        List<RewardItemResponse> response = rewardItemService.getAllItems();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Lấy danh sách phần thưởng đang mở bán")
    public ResponseEntity<ApiResponse<List<RewardItemResponse>>> getActiveItems() {
        List<RewardItemResponse> response = rewardItemService.getActiveItems();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/available")
    @Operation(summary = "Lấy danh sách phần thưởng sẵn có (Active + Còn hàng)")
    public ResponseEntity<ApiResponse<List<RewardItemResponse>>> getAvailableItems() {
        List<RewardItemResponse> response = rewardItemService.getAvailableItems();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết phần thưởng")
    public ResponseEntity<ApiResponse<RewardItemResponse>> getItemById(@PathVariable UUID id) {
        RewardItemResponse response = rewardItemService.getItemById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/redeem")
    @PreAuthorize("hasRole('CITIZEN')")
    @Operation(summary = "Đổi điểm lấy phần thưởng", description = "Citizen đổi điểm để nhận phần thưởng (trừ trực tiếp điểm)")
    public ResponseEntity<ApiResponse<Void>> redeemItem(
            @RequestHeader("X-User-Id") UUID citizenUserId,
            @Valid @RequestBody RedeemRequest request) {
        rewardItemService.redeemItem(citizenUserId, request.getItemId());
        return ResponseEntity.ok(ApiResponse.success("Đổi thưởng thành công", null));
    }
}
