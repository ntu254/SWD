package demo.uc05.config;

/**
 * Abstract Product B (Abstract Factory)
 * Defines redemption rules for a reward tier.
 */
public interface RedemptionPolicy {
    /** Minimum points a citizen must have before redeeming. */
    int getMinBalanceRequired();

    /** Maximum single redemption allowed. 0 = no limit. */
    int getMaxSingleRedemption();

    /** Human-readable description of this policy. */
    String describe();

    /** Validates a redemption attempt. Throws if invalid. */
    void validate(int currentBalance, int pointsToRedeem);
}
