package demo.uc29.config;

import demo.uc29.entity.RewardItem;
import java.util.UUID;

/** Abstract Product B (UC-29): Validates citizen's right to redeem an item. */
public interface RedeemValidator {
    void validate(UUID citizenId, RewardItem item, int currentPoints);

    String describe();
}
