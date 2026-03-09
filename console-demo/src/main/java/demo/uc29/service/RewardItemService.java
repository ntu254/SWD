package demo.uc29.service;

import demo.uc29.entity.RewardItem;

import java.util.List;
import java.util.UUID;

/**
 * UC-29 Service Interface
 * Pattern: Strategy
 */
public interface RewardItemService {
    RewardItem createItem(String name, String description, int pointsCost, int stock, String imageUrl);

    RewardItem updateItem(UUID itemId, String name, String description, int pointsCost, int stock, String imageUrl);

    void deleteItem(UUID itemId);

    void activateItem(UUID itemId);

    void deactivateItem(UUID itemId);

    RewardItem getItemById(UUID itemId);

    List<RewardItem> getAllItems();

    List<RewardItem> getActiveItems();

    List<RewardItem> getAvailableItems();

    /**
     * Citizen redeems points for a reward item.
     * Pattern: Facade - hides: stock check + point deduction
     */
    void redeemItem(UUID citizenUserId, UUID itemId, int currentPoints);
}
