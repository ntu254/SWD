package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface RewardService {

    // ===================== REWARD ITEM CRUD =====================

    RewardItemResponse createRewardItem(CreateRewardItemRequest request);

    RewardItemResponse updateRewardItem(UUID id, UpdateRewardItemRequest request);

    RewardItemResponse getRewardItemById(UUID id);

    Page<RewardItemResponse> getAllRewardItems(String status, String search, Pageable pageable);

    void deleteRewardItem(UUID id);

    // ===================== REDEMPTION MANAGEMENT =====================

    Page<RedemptionResponse> getAllRedemptions(String status, Pageable pageable);

    RedemptionResponse getRedemptionById(UUID id);

    RedemptionResponse approveRedemption(UUID id);

    RedemptionResponse rejectRedemption(UUID id, RejectRedemptionRequest request);
}
