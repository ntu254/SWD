package demo.uc29.config;

import demo.uc29.entity.RewardItem;
import java.util.UUID;

/**
 * Concrete Factory 2 (UC-29): Limited Edition Config
 * - StockPolicy : max 1 per redeem, alert at stock < 3
 * - RedeemValidator: strict - citizen must have 2x the item cost
 */
public class LimitedEditionConfigFactory implements ItemConfigFactory {

    @Override
    public StockPolicy createStockPolicy() {
        return new StockPolicy() {
            @Override
            public int getMaxRedeemPerTransaction() {
                return 1;
            }

            @Override
            public int getLowStockThreshold() {
                return 3;
            }

            @Override
            public void checkLowStock(RewardItem item) {
                if (item.getStock() > 0 && item.getStock() <= getLowStockThreshold())
                    System.out.println("  [!]   [LIMITED] CRITICAL LOW STOCK: \""
                            + item.getName() + "\" - only " + item.getStock() + " remaining!");
            }

            @Override
            public String describe() {
                return "Limited Edition: max 1/redeem, critical alert when stock <= 3";
            }
        };
    }

    @Override
    public RedeemValidator createRedeemValidator() {
        return new RedeemValidator() {
            @Override
            public void validate(UUID citizenId, RewardItem item, int currentPoints) {
                if (!item.isActive())
                    throw new IllegalStateException("[LIMITED] Item is inactive: " + item.getName());
                if (item.getStock() <= 0)
                    throw new IllegalStateException("[LIMITED] Sold out: " + item.getName());
                // Strict: must have at least 1.5x the cost as balance
                int minRequired = (int) (item.getPointsCost() * 1.5);
                if (currentPoints < minRequired)
                    throw new IllegalStateException(
                            "[LIMITED] Must have 1.5x item cost available. Have=" + currentPoints
                                    + " Required=" + minRequired + " (item=" + item.getPointsCost() + " pts)");
            }

            @Override
            public String describe() {
                return "Limited Edition: must have 1.5x item cost as balance";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Limited Edition Config (1/redeem, 1.5x balance)";
    }
}
