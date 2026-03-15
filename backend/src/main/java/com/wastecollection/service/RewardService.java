package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.reward.*;
import com.wastecollection.dto.task.CompleteVisitRequest;
import com.wastecollection.entity.*;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {
    private static final String COLLECTION_REWARD_REASON = "COLLECTION_REWARD";
    private static final String REDEMPTION_REASON_PREFIX = "REDEMPTION:";

    private final RewardTransactionRepository transactionRepository;
    private final RewardItemRepository itemRepository;
    private final CitizenRepository citizenRepository;
    private final CitizenRewardRuleRepository rewardRuleRepository;

    @Transactional
    public void calculateAndAwardPoints(UUID citizenId,
                                        CollectionVisit visit,
                                        List<CompleteVisitRequest.WasteItemInput> items) {
        if (visit.getVisitId() != null
                && transactionRepository.existsByVisit_VisitIdAndReasonCode(visit.getVisitId(), COLLECTION_REWARD_REASON)) {
            log.warn("Skipping duplicate collection reward for visit {}", visit.getVisitId());
            return;
        }

        double totalPoints = 0;

        for (CompleteVisitRequest.WasteItemInput item : items) {
            if (item.getWasteTypeId() == null || item.getSortingLevel() == null) continue;

            var ruleOpt = rewardRuleRepository
                    .findByWasteType_WasteTypeIdAndSortingLevelAndIsActiveTrue(
                            item.getWasteTypeId(), item.getSortingLevel());

            if (ruleOpt.isPresent()) {
                CitizenRewardRule rule = ruleOpt.get();
                double points = (rule.getPointsFixed() != null ? rule.getPointsFixed() : 0);
                if (rule.getPointsPerKg() != null && item.getWeightKg() != null) {
                    points += rule.getPointsPerKg() * item.getWeightKg();
                }
                totalPoints += points;
            }
        }

        int awardedPoints = (int) Math.round(totalPoints);
        if (awardedPoints > 0) {
            Citizen citizen = loadCitizenForUpdate(citizenId);
            warnIfBalanceOutOfSync(citizen);

            RewardTransaction tx = RewardTransaction.builder()
                    .citizen(citizen.getUser())
                    .visit(visit)
                    .pointsDelta((double) awardedPoints)
                    .reasonCode(COLLECTION_REWARD_REASON)
                    .build();
            transactionRepository.save(tx);

            citizen.setPoints(getSafeCitizenPoints(citizen) + awardedPoints);
            citizenRepository.save(citizen);
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<RewardTransactionDto> getMyTransactions(UUID citizenId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RewardTransaction> txPage = transactionRepository
                .findByCitizen_UserIdOrderByCreatedAtDesc(citizenId, pageable);
        return new PageResponse<>(
                txPage.getContent().stream().map(this::mapTxToDto).toList(),
                txPage.getNumber(), txPage.getSize(),
                txPage.getTotalElements(), txPage.getTotalPages(), txPage.isLast());
    }

    @Transactional(readOnly = true)
    public int getPointsBalance(UUID citizenId) {
        return citizenRepository.findByUser_UserId(citizenId)
                .map(Citizen::getPoints)
                .orElse(0);
    }

    @Transactional(readOnly = true)
    public List<RewardItemDto> getAvailableItems() {
        return itemRepository.findByIsActiveTrueAndPointsCostGreaterThanAndStockGreaterThanOrderByPointsCostAsc(0, 0)
                .stream().map(this::mapItemToDto).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<RewardItemDto> getAllItems(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RewardItem> p = itemRepository.findAll(pageable);
        return new PageResponse<>(p.getContent().stream().map(this::mapItemToDto).toList(),
                p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages(), p.isLast());
    }

    @Transactional
    public RewardItemDto createItem(RewardItemDto req) {
        validateRewardItemRequest(req);

        RewardItem item = RewardItem.builder()
                .name(req.getName().trim())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .pointsCost(req.getPointsCost())
                .stock(req.getStock())
                .isActive(req.getIsActive())
                .build();
        normalizeRewardItemState(item);
        return mapItemToDto(itemRepository.save(item));
    }

    @Transactional
    public RewardItemDto updateItem(UUID itemId, RewardItemDto req) {
        validateRewardItemRequest(req);

        RewardItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardItem", "id", itemId));
        item.setName(req.getName().trim());
        item.setDescription(req.getDescription());
        item.setImageUrl(req.getImageUrl());
        item.setPointsCost(req.getPointsCost());
        item.setStock(req.getStock());
        item.setIsActive(req.getIsActive());
        normalizeRewardItemState(item);
        return mapItemToDto(itemRepository.save(item));
    }

    @Transactional
    public void deactivateItem(UUID itemId) {
        RewardItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardItem", "id", itemId));
        item.setIsActive(false);
        itemRepository.save(item);
    }

    @Transactional
    public RewardTransactionDto redeemItem(UUID citizenId, RedeemItemRequest request) {
        UUID itemId = request.getItemId();
        RewardItem item = itemRepository.findByIdForUpdate(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardItem", "id", itemId));

        validateRewardItemForRedemption(item);

        Citizen citizen = loadCitizenForUpdate(citizenId);
        warnIfBalanceOutOfSync(citizen);

        if (getSafeCitizenPoints(citizen) < item.getPointsCost()) {
            throw new BadRequestException("Insufficient points. Required: " + item.getPointsCost()
                    + ", Available: " + getSafeCitizenPoints(citizen));
        }

        item.setStock(item.getStock() - 1);
        normalizeRewardItemState(item);
        itemRepository.save(item);

        citizen.setPoints(getSafeCitizenPoints(citizen) - item.getPointsCost());
        citizenRepository.save(citizen);

        RewardTransaction tx = RewardTransaction.builder()
                .citizen(citizen.getUser())
                .pointsDelta((double) -item.getPointsCost())
                .reasonCode(REDEMPTION_REASON_PREFIX + itemId)
                .build();
        return mapTxToDto(transactionRepository.save(tx));
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getLeaderboard(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Citizen> citizens = citizenRepository.findLeaderboard(pageable);
        AtomicInteger rank = new AtomicInteger(1);
        return citizens.stream().map(c -> LeaderboardEntryDto.builder()
                .rank(rank.getAndIncrement())
                .citizenUserId(c.getUserId())
                .displayName(c.getUser().getDisplayName())
                .avatarUrl(c.getUser().getAvatarUrl())
                .points(c.getPoints())
                .build()).toList();
    }

    private RewardTransactionDto mapTxToDto(RewardTransaction t) {
        return RewardTransactionDto.builder()
                .transactionId(t.getTransactionId())
                .citizenUserId(t.getCitizen().getUserId())
                .pointsDelta(t.getPointsDelta())
                .reasonCode(t.getReasonCode())
                .visitId(t.getVisit() != null ? t.getVisit().getVisitId() : null)
                .createdAt(t.getCreatedAt())
                .build();
    }

    private RewardItemDto mapItemToDto(RewardItem i) {
        return RewardItemDto.builder()
                .itemId(i.getItemId())
                .name(i.getName())
                .description(i.getDescription())
                .imageUrl(i.getImageUrl())
                .pointsCost(i.getPointsCost())
                .stock(i.getStock())
                .isActive(i.getIsActive())
                .build();
    }

    private Citizen loadCitizenForUpdate(UUID citizenId) {
        return citizenRepository.findByUserIdForUpdate(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen", "id", citizenId));
    }

    private int getSafeCitizenPoints(Citizen citizen) {
        return citizen.getPoints() != null ? citizen.getPoints() : 0;
    }

    private void validateRewardItemRequest(RewardItemDto req) {
        if (req.getName() == null || req.getName().isBlank()) {
            throw new BadRequestException("Reward item name is required");
        }
        if (req.getPointsCost() == null || req.getPointsCost() <= 0) {
            throw new BadRequestException("Reward item points cost must be greater than 0");
        }
        if (req.getStock() == null || req.getStock() < 0) {
            throw new BadRequestException("Reward item stock must be 0 or greater");
        }
        if (req.getIsActive() == null) {
            throw new BadRequestException("Reward item active state is required");
        }
    }

    private void validateRewardItemForRedemption(RewardItem item) {
        if (!Boolean.TRUE.equals(item.getIsActive())) {
            throw new BadRequestException("This reward item is not available");
        }
        if (item.getPointsCost() == null || item.getPointsCost() <= 0) {
            throw new BadRequestException("This reward item has invalid points cost");
        }
        if (item.getStock() == null || item.getStock() <= 0) {
            throw new BadRequestException("This reward item is out of stock");
        }
    }

    private void normalizeRewardItemState(RewardItem item) {
        if (item.getStock() == null || item.getStock() <= 0) {
            item.setStock(item.getStock() == null ? 0 : item.getStock());
            item.setIsActive(false);
        } else if (item.getIsActive() == null) {
            item.setIsActive(true);
        }
    }

    private void warnIfBalanceOutOfSync(Citizen citizen) {
        double transactionBalance = transactionRepository.sumPointsByCitizen(citizen.getUserId());
        int storedPoints = getSafeCitizenPoints(citizen);
        if (Math.round(transactionBalance) != storedPoints) {
            log.warn(
                    "Citizen reward balance mismatch detected. citizenId={}, storedPoints={}, transactionBalance={}",
                    citizen.getUserId(),
                    storedPoints,
                    transactionBalance
            );
        }
    }
}
