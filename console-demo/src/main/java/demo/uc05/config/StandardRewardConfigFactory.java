package demo.uc05.config;

/**
 * Concrete Factory 1: Standard Tier
 * Products: x1.0 multiplier + strict redemption policy (min 50 pts)
 */
public class StandardRewardConfigFactory implements RewardConfigFactory {

    @Override
    public PointMultiplier createPointMultiplier() {
        return new PointMultiplier() {
            @Override
            public int apply(int base) {
                return base;
            }

            @Override
            public String describe() {
                return "x1.0 (Standard - no bonus)";
            }
        };
    }

    @Override
    public RedemptionPolicy createRedemptionPolicy() {
        return new RedemptionPolicy() {
            @Override
            public int getMinBalanceRequired() {
                return 50;
            }

            @Override
            public int getMaxSingleRedemption() {
                return 300;
            }

            @Override
            public String describe() {
                return "Standard: min balance=50 pts, max single redeem=300 pts";
            }

            @Override
            public void validate(int balance, int toRedeem) {
                if (balance < getMinBalanceRequired())
                    throw new IllegalStateException(
                            "Balance " + balance + " pts is below minimum " + getMinBalanceRequired() + " pts");
                if (toRedeem > getMaxSingleRedemption())
                    throw new IllegalStateException(
                            "Cannot redeem " + toRedeem + " pts at once. Max=" + getMaxSingleRedemption() + " pts");
                if (balance < toRedeem)
                    throw new IllegalStateException(
                            "Not enough points. Have=" + balance + ", Need=" + toRedeem);
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Standard Reward Config (Basic Tier)";
    }
}
