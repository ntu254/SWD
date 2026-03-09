package demo.uc05.service;

import demo.uc05.config.PointMultiplier;
import demo.uc05.config.RedemptionPolicy;
import demo.uc05.config.RewardConfigFactory;
import demo.uc05.config.StandardRewardConfigFactory;
import demo.uc05.entity.RewardTransaction;
import demo.uc05.repository.RewardTransactionRepository;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * UC-05 Service Implementation
 * Pattern: Strategy (implements RewardService interface)
 * Pattern: Abstract Factory - uses RewardConfigFactory to get PointMultiplier +
 * RedemptionPolicy
 *
 * The factory decides HOW points are calculated and WHAT rules apply for
 * redemption.
 * This class does not know which factory is used - it only depends on the
 * products.
 */
public class RewardServiceImpl implements RewardService {

    private final RewardTransactionRepository repo;
    private final PointMultiplier multiplier; // Created by Abstract Factory
    private final RedemptionPolicy policy; // Created by Abstract Factory

    /** Constructor with explicit factory (Abstract Factory pattern). */
    public RewardServiceImpl(RewardTransactionRepository repo, RewardConfigFactory factory) {
        this.repo = repo;
        this.multiplier = factory.createPointMultiplier();
        this.policy = factory.createRedemptionPolicy();
    }

    /**
     * Backward-compatible constructor: uses StandardRewardConfigFactory by default.
     */
    public RewardServiceImpl(RewardTransactionRepository repo) {
        this(repo, new StandardRewardConfigFactory());
    }

    public PointMultiplier getMultiplier() {
        return multiplier;
    }

    public RedemptionPolicy getPolicy() {
        return policy;
    }

    @Override
    public int getPoints(UUID citizenUserId) {
        return (int) repo.sumPointsByCitizenUserId(citizenUserId);
    }

    @Override
    public List<RewardTransaction> getTransactionHistory(UUID citizenUserId) {
        return repo.findByCitizenUserId(citizenUserId);
    }

    @Override
    public RewardTransaction earnPoints(UUID citizenUserId, String citizenName,
            int basePoints, String reason) {
        if (basePoints <= 0)
            throw new IllegalArgumentException("Points must be > 0");
        // Abstract Factory Product A: apply multiplier
        int actualPoints = multiplier.apply(basePoints);
        RewardTransaction tx = new RewardTransaction(citizenUserId, citizenName, actualPoints, reason);
        repo.save(tx);
        return tx;
    }

    @Override
    public RewardTransaction redeemPoints(UUID citizenUserId, String citizenName, int points) {
        int current = getPoints(citizenUserId);
        // Abstract Factory Product B: validate redemption policy
        policy.validate(current, points);
        RewardTransaction tx = new RewardTransaction(
                citizenUserId, citizenName, -points, "REDEMPTION");
        repo.save(tx);
        return tx;
    }

    @Override
    public void showLeaderboard(int topN) {
        Map<UUID, String> names = repo.getNameMap();
        List<Map.Entry<UUID, Double>> ranking = repo.findLeaderboard(topN);
        System.out.printf("     %-4s %-20s %s%n", "Rank", "Citizen Name", "Total Points");
        System.out.println("     " + "-".repeat(40));
        for (int i = 0; i < ranking.size(); i++) {
            Map.Entry<UUID, Double> entry = ranking.get(i);
            String name = names.getOrDefault(entry.getKey(), "Unknown");
            System.out.printf("     %-4s %-20s %,.0f pts%n",
                    (i + 1) + ".", name, entry.getValue());
        }
    }
}
