package demo.uc29.decorator;

import demo.uc29.entity.RewardItem;
import demo.uc29.service.RewardItemService;

import java.util.List;
import java.util.UUID;

/**
 * Abstract Decorator (UC-29): Wraps RewardItemService and delegates all calls.
 */
public abstract class RewardItemServiceDecorator implements RewardItemService {

    protected final RewardItemService wrapped;

    protected RewardItemServiceDecorator(RewardItemService wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public RewardItem createItem(String name, String desc, int pts, int stock, String img) {
        return wrapped.createItem(name, desc, pts, stock, img);
    }

    @Override
    public RewardItem updateItem(UUID id, String name, String desc, int pts, int stock, String img) {
        return wrapped.updateItem(id, name, desc, pts, stock, img);
    }

    @Override
    public void deleteItem(UUID id) {
        wrapped.deleteItem(id);
    }

    @Override
    public void activateItem(UUID id) {
        wrapped.activateItem(id);
    }

    @Override
    public void deactivateItem(UUID id) {
        wrapped.deactivateItem(id);
    }

    @Override
    public RewardItem getItemById(UUID id) {
        return wrapped.getItemById(id);
    }

    @Override
    public List<RewardItem> getAllItems() {
        return wrapped.getAllItems();
    }

    @Override
    public List<RewardItem> getActiveItems() {
        return wrapped.getActiveItems();
    }

    @Override
    public List<RewardItem> getAvailableItems() {
        return wrapped.getAvailableItems();
    }

    @Override
    public void redeemItem(UUID citizenId, UUID itemId, int pts) {
        wrapped.redeemItem(citizenId, itemId, pts);
    }
}
