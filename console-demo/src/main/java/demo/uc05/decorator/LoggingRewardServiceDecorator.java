package demo.uc05.decorator;

import demo.common.Colors;
import demo.uc05.entity.RewardTransaction;
import demo.uc05.service.RewardService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Concrete Decorator 1: Logging
 * Adds audit log before/after every earn & redeem operation.
 * Does NOT change any business logic - only adds cross-cutting concern.
 */
public class LoggingRewardServiceDecorator extends RewardServiceDecorator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public LoggingRewardServiceDecorator(RewardService wrapped) {
        super(wrapped);
    }

    @Override
    public RewardTransaction earnPoints(UUID citizenUserId, String citizenName,
            int points, String reason) {
        log("[EARN] " + citizenName + " | +" + points + " pts | reason=" + reason);
        RewardTransaction tx = wrapped.earnPoints(citizenUserId, citizenName, points, reason);
        log("[EARN] Done | TX=" + tx.getTransactionId().toString().substring(0, 8)
                + " | balance=" + wrapped.getPoints(citizenUserId) + " pts");
        return tx;
    }

    @Override
    public RewardTransaction redeemPoints(UUID citizenUserId, String citizenName, int points) {
        int before = wrapped.getPoints(citizenUserId);
        log("[REDEEM] " + citizenName + " | -" + points + " pts | before=" + before + " pts");
        RewardTransaction tx = wrapped.redeemPoints(citizenUserId, citizenName, points);
        int after = wrapped.getPoints(citizenUserId);
        log("[REDEEM] Done | TX=" + tx.getTransactionId().toString().substring(0, 8)
                + " | after=" + after + " pts");
        return tx;
    }

    private void log(String msg) {
        System.out.println(Colors.purple(
                "  [LOG " + LocalDateTime.now().format(FMT) + "] " + msg));
    }
}
