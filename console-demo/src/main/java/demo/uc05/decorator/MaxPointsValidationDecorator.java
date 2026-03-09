package demo.uc05.decorator;

import demo.common.Colors;
import demo.uc05.entity.RewardTransaction;
import demo.uc05.service.RewardService;

import java.util.UUID;

/**
 * Concrete Decorator 2: Max-Points Validation
 * Adds an extra business rule: single transaction cannot exceed
 * MAX_EARN_PER_TX.
 * Stacks on top of LoggingRewardServiceDecorator (or any other decorator).
 */
public class MaxPointsValidationDecorator extends RewardServiceDecorator {

    private static final int MAX_EARN_PER_TX = 500;
    private static final int MAX_REDEEM_PER_TX = 400;

    public MaxPointsValidationDecorator(RewardService wrapped) {
        super(wrapped);
    }

    @Override
    public RewardTransaction earnPoints(UUID citizenUserId, String citizenName,
            int points, String reason) {
        if (points > MAX_EARN_PER_TX) {
            System.out.println(Colors.yellow("  [VALIDATION] Earn " + points
                    + " pts exceeds single-TX cap of " + MAX_EARN_PER_TX
                    + " pts. Capped automatically."));
            points = MAX_EARN_PER_TX;
        }
        return wrapped.earnPoints(citizenUserId, citizenName, points, reason);
    }

    @Override
    public RewardTransaction redeemPoints(UUID citizenUserId, String citizenName, int points) {
        if (points > MAX_REDEEM_PER_TX) {
            throw new IllegalArgumentException(
                    "[VALIDATION] Cannot redeem " + points
                            + " pts in one go. Max per transaction=" + MAX_REDEEM_PER_TX + " pts");
        }
        return wrapped.redeemPoints(citizenUserId, citizenName, points);
    }
}
