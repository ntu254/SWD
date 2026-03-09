package demo.uc29.config;

import demo.uc29.entity.RewardItem;
import java.util.UUID;

/**
 * Concrete Factory 1 (UC-29): Regular Item Config
 * - StockPolicy : max 10 per redeem, alert at stock < 5
 * - RedeemValidator: standard - just check points & active
 */
public class RegularItemConfigFactory implements ItemConfigFactory {

    @Override
    public StockPolicy createStockPolicy() {
        return new StockPolicy() {
            @Override
            public int getMaxRedeemPerTransaction() {
                return 10;
            }

            @Override
            public int getLowStockThreshold() {
                return 5;
            }

            @Override
            public void checkLowStock(RewardItem item) {
                if (item.getStock() > 0 && item.getStock() <= getLowStockThreshold())
                    System.out.println("  [!]   LOW STOCK WARNING: \""
                            + item.getName() + "\" has only " + item.getStock() + " left!");
            }

            @Override
            public String describe() {
                return "Regular: max 10/redeem, alert when stock <= 5";
            }
        };
    }

    @Override
    public RedeemValidator createRedeemValidator() {
        return new RedeemValidator() {
            @Override
            public void validate(UUID citizenId, RewardItem item, int currentPoints) {
                if (!item.isActive())
                    throw new IllegalStateException("Item is inactive: " + item.getName());
                if (item.getStock() <= 0)
                    throw new IllegalStateException("Item out of stock: " + item.getName());
                if (currentPoints < item.getPointsCost())
                    throw new IllegalStateException("Not enough points. Have="
                            + currentPoints + " Need=" + item.getPointsCost());
            }

            @Override
            public String describe() {
                return "Regular: standard point & stock check";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Regular Item Config";
    }
}
