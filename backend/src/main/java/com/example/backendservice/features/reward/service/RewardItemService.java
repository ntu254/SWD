package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.CreateRewardItemRequest;
import com.example.backendservice.features.reward.dto.RewardItemResponse;

import java.util.List;
import java.util.UUID;

public interface RewardItemService {

    RewardItemResponse createItem(CreateRewardItemRequest request);

    RewardItemResponse updateItem(UUID itemId, CreateRewardItemRequest request);

    void deleteItem(UUID itemId);

    void activateItem(UUID itemId);

    void deactivateItem(UUID itemId);

    RewardItemResponse getItemById(UUID itemId);

    List<RewardItemResponse> getAllItems();

    List<RewardItemResponse> getActiveItems();

    List<RewardItemResponse> getAvailableItems();

    void redeemItem(UUID citizenUserId, UUID itemId);
}
