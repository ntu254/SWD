package demo.uc05.service;

import demo.uc05.entity.RewardTransaction;

import java.util.List;
import java.util.UUID;

/**
 * UC-05 Service Interface
 * Pattern: Strategy - Controller depends on interface, not on Impl
 */
public interface RewardService {
    int getPoints(UUID citizenUserId);

    List<RewardTransaction> getTransactionHistory(UUID citizenUserId);

    RewardTransaction earnPoints(UUID citizenUserId, String citizenName, int points, String reason);

    RewardTransaction redeemPoints(UUID citizenUserId, String citizenName, int points);

    void showLeaderboard(int topN);
}
