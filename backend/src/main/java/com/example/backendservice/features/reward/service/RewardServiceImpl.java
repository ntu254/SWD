package com.example.backendservice.features.reward.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.reward.dto.*;
import com.example.backendservice.features.reward.repository.LeaderboardProjection;
import com.example.backendservice.features.reward.entity.RewardTransaction;
import com.example.backendservice.features.reward.repository.RewardTransactionRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of RewardService
 * Quản lý giao dịch điểm thưởng và số dư điểm
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RewardServiceImpl implements RewardService {

    private final RewardTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public RewardTransactionResponse createTransaction(CreateRewardTransactionRequest request) {
        User citizen = userRepository.findByUserId(request.getCitizenUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Citizen not found: " + request.getCitizenUserId()));

        double pointsDelta = "EARN".equals(request.getTransactionType())
                ? request.getPointsAmount()
                : -request.getPointsAmount();

        RewardTransaction transaction = RewardTransaction.builder()
                .citizenUser(citizen)
                .pointsDelta(pointsDelta)
                .reasonCode(request.getTransactionType())
                .build();

        transaction = transactionRepository.save(transaction);

        log.info("Created {} transaction for citizen {}: {} points",
                request.getTransactionType(), request.getCitizenUserId(), request.getPointsAmount());

        return toTransactionResponse(transaction);
    }

    @Override
    @Transactional
    public RewardTransactionResponse earnPoints(UUID citizenUserId, Integer points, String description,
            UUID referenceId) {
        CreateRewardTransactionRequest request = CreateRewardTransactionRequest.builder()
                .citizenUserId(citizenUserId)
                .transactionType("EARN")
                .pointsAmount(points)
                .description(description)
                .referenceId(referenceId)
                .build();
        return createTransaction(request);
    }

    @Override
    @Transactional
    public RewardTransactionResponse redeemPoints(UUID citizenUserId, Integer points, String description) {
        // Kiểm tra citizen có đủ điểm không
        Integer currentPoints = getCitizenPoints(citizenUserId);
        if (currentPoints < points) {
            throw new IllegalStateException(
                    "Insufficient points. Current: " + currentPoints + ", Required: " + points);
        }

        CreateRewardTransactionRequest request = CreateRewardTransactionRequest.builder()
                .citizenUserId(citizenUserId)
                .transactionType("REDEEM")
                .pointsAmount(points)
                .description(description)
                .build();
        return createTransaction(request);
    }

    @Override
    public RewardTransactionResponse getTransactionById(UUID transactionId) {
        RewardTransaction transaction = transactionRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));
        return toTransactionResponse(transaction);
    }

    @Override
    public Page<RewardTransactionResponse> getTransactionsByCitizen(UUID citizenUserId, Pageable pageable) {
        List<RewardTransaction> transactions = transactionRepository.findByCitizenUserId(citizenUserId);
        List<RewardTransactionResponse> responses = transactions.stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        if (start > responses.size()) {
            return new PageImpl<>(List.of(), pageable, responses.size());
        }

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<RewardTransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(this::toTransactionResponse);
    }

    @Override
    public Integer getCitizenPoints(UUID citizenUserId) {
        Double totalPoints = transactionRepository.sumPointsByCitizenUserId(citizenUserId);
        return totalPoints != null ? totalPoints.intValue() : 0;
    }

    @Override
    public List<LeaderboardEntryResponse> getLeaderboard(UUID areaId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<LeaderboardProjection> ranking = transactionRepository.findLeaderboard(areaId, PageRequest.of(0, safeLimit));

        return java.util.stream.IntStream.range(0, ranking.size())
                .mapToObj(index -> {
                    LeaderboardProjection row = ranking.get(index);
                    String firstName = row.getFirstName() != null ? row.getFirstName() : "";
                    String lastName = row.getLastName() != null ? row.getLastName() : "";
                    return LeaderboardEntryResponse.builder()
                            .rank(index + 1)
                            .userId(row.getUserId())
                            .firstName(firstName)
                            .lastName(lastName)
                            .fullName((firstName + " " + lastName).trim())
                            .totalPoints(row.getTotalPoints() != null ? row.getTotalPoints().intValue() : 0)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private RewardTransactionResponse toTransactionResponse(RewardTransaction transaction) {
        User citizen = transaction.getCitizenUser();
        return RewardTransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .citizenUserId(transaction.getCitizenUserId())
                .citizenName(citizen != null ? citizen.getFullName() : null)
                .transactionType(transaction.getReasonCode())
                .pointsAmount(transaction.getPointsDelta() != null ? transaction.getPointsDelta().intValue() : 0)
                .description(transaction.getReasonCode())
                .referenceId(null)
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
