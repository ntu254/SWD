package com.example.backendservice.features.reward.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.reward.dto.CreateRewardItemRequest;
import com.example.backendservice.features.reward.dto.RewardItemResponse;
import com.example.backendservice.features.reward.entity.RewardItem;
import com.example.backendservice.features.reward.repository.RewardItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardItemServiceImpl implements RewardItemService {

    private final RewardItemRepository itemRepository;
    private final RewardService rewardService;

    @Override
    @Transactional
    public RewardItemResponse createItem(CreateRewardItemRequest request) {
        log.info("Creating reward item: {}", request.getName());
        RewardItem item = RewardItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pointsCost(request.getPointsCost())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();
        return toResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public RewardItemResponse updateItem(UUID itemId, CreateRewardItemRequest request) {
        log.info("Updating reward item: {}", itemId);
        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPointsCost(request.getPointsCost());
        item.setStock(request.getStock());
        item.setImageUrl(request.getImageUrl());

        return toResponse(itemRepository.save(item));
    }

    @Override
    @Transactional
    public void deleteItem(UUID itemId) {
        log.info("Deleting reward item: {}", itemId);
        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        itemRepository.delete(item);
    }

    @Override
    @Transactional
    public void activateItem(UUID itemId) {
        log.info("Activating reward item: {}", itemId);
        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        item.setIsActive(true);
        itemRepository.save(item);
    }

    @Override
    @Transactional
    public void deactivateItem(UUID itemId) {
        log.info("Deactivating reward item: {}", itemId);
        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        item.setIsActive(false);
        itemRepository.save(item);
    }

    @Override
    public RewardItemResponse getItemById(UUID itemId) {
        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));
        return toResponse(item);
    }

    @Override
    public List<RewardItemResponse> getAllItems() {
        return itemRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RewardItemResponse> getActiveItems() {
        return itemRepository.findAllActiveItems().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RewardItemResponse> getAvailableItems() {
        return itemRepository.findAvailableItems().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void redeemItem(UUID citizenUserId, UUID itemId) {
        log.info("Citizen {} redeeming item {}", citizenUserId, itemId);

        RewardItem item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found: " + itemId));

        if (!item.getIsActive()) {
            throw new IllegalStateException("Item is not active");
        }
        if (item.getStock() <= 0) {
            throw new IllegalStateException("Item is out of stock");
        }

        // Deduct points (this throws exception if not enough points)
        rewardService.redeemPoints(citizenUserId, item.getPointsCost(), "Đổi phần thưởng: " + item.getName());

        // Deduct stock
        item.setStock(item.getStock() - 1);
        itemRepository.save(item);

        log.info("Citizen {} successfully redeemed item {}. Remaining stock: {}", citizenUserId, itemId,
                item.getStock());
    }

    private RewardItemResponse toResponse(RewardItem item) {
        return RewardItemResponse.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .description(item.getDescription())
                .pointsCost(item.getPointsCost())
                .stock(item.getStock())
                .imageUrl(item.getImageUrl())
                .isActive(item.getIsActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
