package demo.uc29.decorator;

import demo.common.Colors;
import demo.uc29.entity.RewardItem;
import demo.uc29.service.RewardItemService;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/** Concrete Decorator 1 (UC-29): Logs CRUD operations on reward items. */
public class LoggingItemServiceDecorator extends RewardItemServiceDecorator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public LoggingItemServiceDecorator(RewardItemService wrapped) {
        super(wrapped);
    }

    @Override
    public RewardItem createItem(String name, String desc, int pts, int stock, String img) {
        log("[CREATE] name=" + name + " | pts=" + pts + " | stock=" + stock);
        RewardItem item = wrapped.createItem(name, desc, pts, stock, img);
        log("[CREATE] OK | id=" + item.getItemId().toString().substring(0, 8));
        return item;
    }

    @Override
    public RewardItem updateItem(UUID id, String name, String desc, int pts, int stock, String img) {
        log("[UPDATE] id=" + id.toString().substring(0, 8) + " | pts=" + pts + " | stock=" + stock);
        RewardItem item = wrapped.updateItem(id, name, desc, pts, stock, img);
        log("[UPDATE] OK | name=" + item.getName());
        return item;
    }

    @Override
    public void deleteItem(UUID id) {
        log("[DELETE] id=" + id.toString().substring(0, 8));
        wrapped.deleteItem(id);
        log("[DELETE] Done");
    }

    @Override
    public void redeemItem(UUID citizenId, UUID itemId, int pts) {
        log("[REDEEM] citizenId=" + citizenId.toString().substring(0, 8)
                + " | itemId=" + itemId.toString().substring(0, 8) + " | points=" + pts);
        wrapped.redeemItem(citizenId, itemId, pts);
        log("[REDEEM] Done");
    }

    private void log(String msg) {
        System.out.println(Colors.purple("  [LOG " + LocalDateTime.now().format(FMT) + "] " + msg));
    }
}
