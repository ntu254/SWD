package demo.uc05.config;

/**
 * Concrete Factory 2: Bonus Event
 * Products: x2.0 multiplier + relaxed policy (min 25 pts, max 1000 pts)
 */
public class BonusEventConfigFactory implements RewardConfigFactory {

    @Override
    public PointMultiplier createPointMultiplier() {
        return new PointMultiplier() {
            @Override
            public int apply(int base) {
                return base * 2;
            }

            @Override
            public String describe() {
                return "x2.0 (Bonus Event - double points!)";
            }
        };
    }

    @Override
    public RedemptionPolicy createRedemptionPolicy() {
        return new RedemptionPolicy() {
            @Override
            public int getMinBalanceRequired() {
                return 25;
            }

            @Override
            public int getMaxSingleRedemption() {
                return 1000;
            }

            @Override
            public String describe() {
                return "Bonus Event: min balance=25 pts, max single redeem=1000 pts";
            }

            @Override
            public void validate(int balance, int toRedeem) {
                if (balance < getMinBalanceRequired())
                    throw new IllegalStateException(
                            "Balance " + balance + " pts is below minimum " + getMinBalanceRequired() + " pts");
                if (toRedeem > getMaxSingleRedemption())
                    throw new IllegalStateException(
                            "Cannot redeem " + toRedeem + " pts. Max=" + getMaxSingleRedemption() + " pts");
                if (balance < toRedeem)
                    throw new IllegalStateException(
                            "Not enough points. Have=" + balance + ", Need=" + toRedeem);
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Bonus Event Reward Config (2x Points!)";
    }
}
