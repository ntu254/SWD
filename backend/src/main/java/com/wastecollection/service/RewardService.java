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

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardTransactionRepository transactionRepository;
    private final RewardItemRepository itemRepository;
    private final CitizenRepository citizenRepository;
    private final CitizenRewardRuleRepository rewardRuleRepository;
    private final CollectionVisitRepository visitRepository;

    @Transactional
    public void calculateAndAwardPoints(UUID citizenId,
                                        CollectionVisit visit,
                                        List<CompleteVisitRequest.WasteItemInput> items) {
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

        if (totalPoints > 0) {
            Citizen citizen = citizenRepository.findByUser_UserId(citizenId)
                    .orElseThrow(() -> new ResourceNotFoundException("Citizen", "id", citizenId));

            RewardTransaction tx = RewardTransaction.builder()
                    .citizen(citizen.getUser())
                    .visit(visit)
                    .pointsDelta(totalPoints)
                    .reasonCode("COLLECTION_REWARD")
                    .build();
            transactionRepository.save(tx);

            citizen.setPoints(citizen.getPoints() + (int) totalPoints);
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
        return itemRepository.findByIsActiveTrueOrderByPointsCostAsc()
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
        RewardItem item = RewardItem.builder()
                .name(req.getName())
                .description(req.getDescription())
                .imageUrl(req.getImageUrl())
                .pointsCost(req.getPointsCost())
                .stock(req.getStock() != null ? req.getStock() : 0)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();
        return mapItemToDto(itemRepository.save(item));
    }

    @Transactional
    public RewardItemDto updateItem(UUID itemId, RewardItemDto req) {
        RewardItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardItem", "id", itemId));
        item.setName(req.getName());
        item.setDescription(req.getDescription());
        item.setImageUrl(req.getImageUrl());
        item.setPointsCost(req.getPointsCost());
        if (req.getStock() != null) item.setStock(req.getStock());
        if (req.getIsActive() != null) item.setIsActive(req.getIsActive());
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
        RewardItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("RewardItem", "id", itemId));

        if (!item.getIsActive()) throw new BadRequestException("This reward item is not available");
        if (item.getStock() <= 0) throw new BadRequestException("This reward item is out of stock");

        Citizen citizen = citizenRepository.findByUser_UserId(citizenId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen", "id", citizenId));

        if (citizen.getPoints() < item.getPointsCost()) {
            throw new BadRequestException("Insufficient points. Required: " + item.getPointsCost()
                    + ", Available: " + citizen.getPoints());
        }

        item.setStock(item.getStock() - 1);
        if (item.getStock() == 0) item.setIsActive(false);
        itemRepository.save(item);

        citizen.setPoints(citizen.getPoints() - item.getPointsCost());
        citizenRepository.save(citizen);

        RewardTransaction tx = RewardTransaction.builder()
                .citizen(citizen.getUser())
                .pointsDelta((double) -item.getPointsCost())
                .reasonCode("REDEMPTION:" + itemId)
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
}
