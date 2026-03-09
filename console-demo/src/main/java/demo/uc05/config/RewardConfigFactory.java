package demo.uc05.config;

/**
 * Abstract Factory Interface
 * Creates a family of related reward configuration objects.
 *
 * Concrete factories produce compatible products:
 * StandardRewardConfigFactory -> x1.0 multiplier, strict policy
 * BonusEventConfigFactory -> x2.0 multiplier, relaxed policy
 * VipRewardConfigFactory -> x3.0 multiplier, no-limit policy
 */
public interface RewardConfigFactory {
    PointMultiplier createPointMultiplier();

    RedemptionPolicy createRedemptionPolicy();

    String getFactoryName();
}
