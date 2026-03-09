package demo.uc29.config;

import demo.uc29.entity.RewardItem;

/** Abstract Product A (UC-29): Stock management policy. */
public interface StockPolicy {
    int getMaxRedeemPerTransaction();

    int getLowStockThreshold();

    void checkLowStock(RewardItem item);

    String describe();
}
