package demo.uc29.service;

import demo.uc29.config.*;
import demo.uc29.entity.RewardItem;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UC-29 Service Implementation
 * Patterns: Strategy, Facade (redeemItem), Repository (in-memory),
 * Abstract Factory (ItemConfigFactory -> StockPolicy + RedeemValidator)
 */
public class RewardItemServiceImpl implements RewardItemService {

    private final Map<UUID, RewardItem> store = new LinkedHashMap<>();
    private final StockPolicy stockPolicy; // Abstract Factory Product A
    private final RedeemValidator redeemValidator; // Abstract Factory Product B

    public RewardItemServiceImpl() {
        this(new RegularItemConfigFactory());
    }

    public RewardItemServiceImpl(ItemConfigFactory factory) {
        this.stockPolicy = factory.createStockPolicy();
        this.redeemValidator = factory.createRedeemValidator();
    }

    public StockPolicy getStockPolicy() {
        return stockPolicy;
    }

    public RedeemValidator getRedeemValidator() {
        return redeemValidator;
    }

    @Override
    public RewardItem createItem(String name, String description,
            int pointsCost, int stock, String imageUrl) {
        if (pointsCost <= 0)
            throw new IllegalArgumentException("Points cost must be > 0");
        if (stock < 0)
            throw new IllegalArgumentException("Stock cannot be negative");
        RewardItem item = new RewardItem(name, description, pointsCost, stock, imageUrl);
        store.put(item.getItemId(), item);
        return item;
    }

    @Override
    public RewardItem updateItem(UUID itemId, String name, String description,
            int pointsCost, int stock, String imageUrl) {
        RewardItem item = find(itemId);
        item.update(name, description, pointsCost, stock, imageUrl);
        return item;
    }

    @Override
    public void deleteItem(UUID itemId) {
        if (!store.containsKey(itemId))
            throw new NoSuchElementException("Item not found: " + itemId);
        store.remove(itemId);
    }

    @Override
    public void activateItem(UUID itemId) {
        find(itemId).activate();
    }

    @Override
    public void deactivateItem(UUID itemId) {
        find(itemId).deactivate();
    }

    @Override
    public RewardItem getItemById(UUID itemId) {
        return find(itemId);
    }

    @Override
    public List<RewardItem> getAllItems() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<RewardItem> getActiveItems() {
        return store.values().stream().filter(RewardItem::isActive).collect(Collectors.toList());
    }

    @Override
    public List<RewardItem> getAvailableItems() {
        return store.values().stream().filter(i -> i.isActive() && i.getStock() > 0)
                .collect(Collectors.toList());
    }

    /**
     * Facade Pattern: hides multi-step redeem complexity.
     * Now enhanced with Abstract Factory products for richer validation.
     * Step 1: RedeemValidator (Product B) validates citizen + item + points
     * Step 2: StockPolicy (Product A) checks low stock alert
     * Step 3: Deduct stock
     */
    @Override
    public void redeemItem(UUID citizenUserId, UUID itemId, int currentPoints) {
        RewardItem item = find(itemId);
        // Abstract Factory Product B: validates redeem eligibility
        redeemValidator.validate(citizenUserId, item, currentPoints);
        // Abstract Factory Product A: check stock policy rules
        stockPolicy.checkLowStock(item);
        // Deduct stock
        item.deductStock();
    }

    private RewardItem find(UUID itemId) {
        RewardItem item = store.get(itemId);
        if (item == null)
            throw new NoSuchElementException("Item not found: " + itemId);
        return item;
    }
}
