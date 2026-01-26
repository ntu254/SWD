package com.example.backendservice.features.reward.service;

import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.entity.RewardItem;
import com.example.backendservice.features.reward.entity.RewardRedemption;
import com.example.backendservice.features.reward.repository.RewardItemRepository;
import com.example.backendservice.features.reward.repository.RewardRedemptionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RewardServiceImpl implements RewardService {

    private final RewardItemRepository rewardItemRepository;
    private final RewardRedemptionRepository redemptionRepository;

    // ===================== REWARD ITEM CRUD =====================

    @Override
    @Transactional
    public RewardItemResponse createRewardItem(CreateRewardItemRequest request) {
        log.info("[REWARD_ITEM_CREATE] Creating new reward item: {}", request.getName());

        RewardItem item = RewardItem.builder()
                .name(request.getName())
                .description(request.getDescription())
                .pointsCost(request.getPointsCost())
                .stock(request.getStock())
                .imageUrl(request.getImageUrl())
                .status("ACTIVE")
                .build();

        RewardItem savedItem = rewardItemRepository.save(item);
        log.info("[REWARD_ITEM_CREATED] Created reward item with id: {}", savedItem.getId());

        return RewardItemResponse.fromEntity(savedItem);
    }

    @Override
    @Transactional
    public RewardItemResponse updateRewardItem(UUID id, UpdateRewardItemRequest request) {
        log.info("[REWARD_ITEM_UPDATE] Updating reward item id: {}", id);

        RewardItem item = rewardItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reward item not found with id: " + id));

        if (request.getName() != null) {
            item.setName(request.getName());
        }
        if (request.getDescription() != null) {
            item.setDescription(request.getDescription());
        }
        if (request.getPointsCost() != null) {
            item.setPointsCost(request.getPointsCost());
        }
        if (request.getStock() != null) {
            item.setStock(request.getStock());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }

        RewardItem updatedItem = rewardItemRepository.save(item);
        log.info("[REWARD_ITEM_UPDATED] Updated reward item id: {}", id);

        return RewardItemResponse.fromEntity(updatedItem);
    }

    @Override
    public RewardItemResponse getRewardItemById(UUID id) {
        RewardItem item = rewardItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reward item not found with id: " + id));
        return RewardItemResponse.fromEntity(item);
    }

    @Override
    public Page<RewardItemResponse> getAllRewardItems(String status, String search, Pageable pageable) {
        Page<RewardItem> items;

        if (status != null && search != null) {
            items = rewardItemRepository.findByStatusAndNameContainingIgnoreCase(status, search, pageable);
        } else if (status != null) {
            items = rewardItemRepository.findByStatus(status, pageable);
        } else if (search != null) {
            items = rewardItemRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            items = rewardItemRepository.findAll(pageable);
        }

        return items.map(RewardItemResponse::fromEntity);
    }

    @Override
    @Transactional
    public void deleteRewardItem(UUID id) {
        log.info("[REWARD_ITEM_DELETE] Deleting reward item id: {}", id);

        if (!rewardItemRepository.existsById(id)) {
            throw new EntityNotFoundException("Reward item not found with id: " + id);
        }

        rewardItemRepository.deleteById(id);
        log.info("[REWARD_ITEM_DELETED] Deleted reward item id: {}", id);
    }

    // ===================== REDEMPTION MANAGEMENT =====================

    @Override
    public Page<RedemptionResponse> getAllRedemptions(String status, Pageable pageable) {
        Page<RewardRedemption> redemptions;

        if (status != null) {
            redemptions = redemptionRepository.findByStatus(status, pageable);
        } else {
            redemptions = redemptionRepository.findAll(pageable);
        }

        return redemptions.map(RedemptionResponse::fromEntity);
    }

    @Override
    public RedemptionResponse getRedemptionById(UUID id) {
        RewardRedemption redemption = redemptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Redemption not found with id: " + id));
        return RedemptionResponse.fromEntity(redemption);
    }

    @Override
    @Transactional
    public RedemptionResponse approveRedemption(UUID id) {
        log.info("[REDEMPTION_APPROVE] Approving redemption id: {}", id);

        RewardRedemption redemption = redemptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Redemption not found with id: " + id));

        if (!"PENDING".equals(redemption.getStatus())) {
            throw new IllegalStateException("Redemption is not in PENDING status");
        }

        RewardItem item = redemption.getRewardItem();
        if (item.getStock() < 1) {
            throw new IllegalStateException("Reward item is out of stock");
        }

        // Deduct stock
        item.setStock(item.getStock() - 1);
        rewardItemRepository.save(item);

        // Update redemption status
        redemption.setStatus("APPROVED");
        redemption.setProcessedAt(LocalDateTime.now());

        RewardRedemption updated = redemptionRepository.save(redemption);
        log.info("[REDEMPTION_APPROVED] Approved redemption id: {}, stock remaining: {}", id, item.getStock());

        return RedemptionResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public RedemptionResponse rejectRedemption(UUID id, RejectRedemptionRequest request) {
        log.info("[REDEMPTION_REJECT] Rejecting redemption id: {}", id);

        RewardRedemption redemption = redemptionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Redemption not found with id: " + id));

        if (!"PENDING".equals(redemption.getStatus())) {
            throw new IllegalStateException("Redemption is not in PENDING status");
        }

        // Refund points to citizen
        var citizen = redemption.getCitizen();
        citizen.setCurrentPoints(citizen.getCurrentPoints() + redemption.getPointsUsed());

        // Update redemption status
        redemption.setStatus("REJECTED");
        redemption.setRejectionReason(request.getReason());
        redemption.setProcessedAt(LocalDateTime.now());

        RewardRedemption updated = redemptionRepository.save(redemption);
        log.info("[REDEMPTION_REJECTED] Rejected redemption id: {}, refunded {} points to citizen",
                id, redemption.getPointsUsed());

        return RedemptionResponse.fromEntity(updated);
    }
}
