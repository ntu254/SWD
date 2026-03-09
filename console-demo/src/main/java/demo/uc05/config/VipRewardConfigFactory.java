package demo.uc05.config;

/**
 * Concrete Factory 3: VIP Tier
 * Products: x3.0 multiplier + no-limit policy (min 0, unlimited single redeem)
 */
public class VipRewardConfigFactory implements RewardConfigFactory {

    @Override
    public PointMultiplier createPointMultiplier() {
        return new PointMultiplier() {
            @Override
            public int apply(int base) {
                return base * 3;
            }

            @Override
            public String describe() {
                return "x3.0 (VIP - triple points!)";
            }
        };
    }

    @Override
    public RedemptionPolicy createRedemptionPolicy() {
        return new RedemptionPolicy() {
            @Override
            public int getMinBalanceRequired() {
                return 0;
            }

            @Override
            public int getMaxSingleRedemption() {
                return Integer.MAX_VALUE;
            }

            @Override
            public String describe() {
                return "VIP: no minimum balance, unlimited single redemption";
            }

            @Override
            public void validate(int balance, int toRedeem) {
                if (balance < toRedeem)
                    throw new IllegalStateException(
                            "Not enough points. Have=" + balance + ", Need=" + toRedeem);
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "VIP Reward Config (3x Points, No Limits)";
    }
}
