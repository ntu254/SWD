package demo.uc05.entity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UC-05 Entity: RewardTransaction
 * Represents a single reward point transaction for a citizen.
 */
public class RewardTransaction {

    private UUID transactionId;
    private UUID citizenUserId;
    private String citizenName;
    private double pointsDelta; // positive = earn, negative = redeem
    private String reasonCode; // COLLECTION, BONUS, PENALTY, REDEMPTION, COMPENSATION
    private LocalDateTime createdAt;

    public RewardTransaction(UUID citizenUserId, String citizenName,
            double pointsDelta, String reasonCode) {
        this.transactionId = UUID.randomUUID();
        this.citizenUserId = citizenUserId;
        this.citizenName = citizenName;
        this.pointsDelta = pointsDelta;
        this.reasonCode = reasonCode;
        this.createdAt = LocalDateTime.now();
    }

    public UUID getTransactionId() {
        return transactionId;
    }

    public UUID getCitizenUserId() {
        return citizenUserId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public double getPointsDelta() {
        return pointsDelta;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
