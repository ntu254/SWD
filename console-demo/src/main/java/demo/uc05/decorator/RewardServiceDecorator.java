package demo.uc05.decorator;

import demo.uc05.entity.RewardTransaction;
import demo.uc05.service.RewardService;

import java.util.List;
import java.util.UUID;

/**
 * Abstract Decorator (Decorator Pattern)
 * Wraps a RewardService and delegates all calls to the wrapped instance.
 * Subclasses override specific methods to add behavior.
 *
 * Component Interface: RewardService
 * Concrete Component: RewardServiceImpl
 * This class: Abstract Decorator
 */
public abstract class RewardServiceDecorator implements RewardService {

    protected final RewardService wrapped;

    protected RewardServiceDecorator(RewardService wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public int getPoints(UUID citizenUserId) {
        return wrapped.getPoints(citizenUserId);
    }

    @Override
    public List<RewardTransaction> getTransactionHistory(UUID citizenUserId) {
        return wrapped.getTransactionHistory(citizenUserId);
    }

    @Override
    public RewardTransaction earnPoints(UUID citizenUserId, String citizenName,
            int points, String reason) {
        return wrapped.earnPoints(citizenUserId, citizenName, points, reason);
    }

    @Override
    public RewardTransaction redeemPoints(UUID citizenUserId, String citizenName, int points) {
        return wrapped.redeemPoints(citizenUserId, citizenName, points);
    }

    @Override
    public void showLeaderboard(int topN) {
        wrapped.showLeaderboard(topN);
    }
}
