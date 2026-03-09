package demo.uc29;

import demo.common.Colors;
import demo.common.ConsoleUtils;
import demo.uc29.config.*;
import demo.uc29.decorator.LoggingItemServiceDecorator;
import demo.uc29.entity.RewardItem;
import demo.uc29.service.RewardItemService;
import demo.uc29.service.RewardItemServiceImpl;

import java.util.List;
import java.util.Scanner;
import java.util.UUID;

/**
 * UC-29: Manage Reward Items
 * Actor: Administrator
 *
 * Patterns demonstrated:
 * - Abstract Factory : ItemConfigFactory (Regular/LimitedEdition)
 * creates StockPolicy + RedeemValidator
 * - Decorator : LoggingItemServiceDecorator
 * - Facade : redeemItem() hides multi-step validation
 * - Strategy : RewardItemService interface
 */
public class UC29_ManageRewardItems {

    private RewardItemService rewardItemService;
    private ItemConfigFactory currentFactory;
    private int citizenPoints = 500;

    public UC29_ManageRewardItems() {
        applyFactory(new RegularItemConfigFactory());
        seedData();
    }

    /** Abstract Factory + Decorator assembly. */
    private void applyFactory(ItemConfigFactory factory) {
        this.currentFactory = factory;
        RewardItemService core = new RewardItemServiceImpl(factory);
        this.rewardItemService = new LoggingItemServiceDecorator(core);
    }

    private void seedData() {
        rewardItemService.createItem("Thermal Bottle", "Stainless 500ml", 200, 50, "bottle.jpg");
        rewardItemService.createItem("Canvas Tote Bag", "Recycled canvas tote", 150, 100, "tote.jpg");
        rewardItemService.createItem("Cafe Voucher", "Highlands Coffee 50K", 300, 30, "voucher.jpg");
        rewardItemService.createItem("Foldable Umbrella", "Anti-UV foldable", 500, 20, "umbrella.jpg");
        RewardItem d = rewardItemService.createItem("Eco T-Shirt", "Organic cotton", 400, 0, "shirt.jpg");
        rewardItemService.deactivateItem(d.getItemId());
    }

    public void run(Scanner sc) {
        boolean running = true;
        while (running) {
            ConsoleUtils.printHeader("UC-29 | MANAGE REWARD ITEMS | Actor: Administrator");
            printCurrentConfig();
            System.out.println();
            System.out.println(Colors.bold("  [1]  View all Items"));
            System.out.println(Colors.bold("  [2]  View Active Items"));
            System.out.println(Colors.bold("  [3]  View Available Items (Active + In Stock)"));
            System.out.println(Colors.bold("  [4]  Create new Item     (Logging Decorator)"));
            System.out.println(Colors.bold("  [5]  Update Item         (Logging Decorator)"));
            System.out.println(Colors.bold("  [6]  Activate Item"));
            System.out.println(Colors.bold("  [7]  Deactivate Item"));
            System.out.println(Colors.bold("  [8]  Delete Item         (Logging Decorator)"));
            System.out.println(Colors.bold("  [9]  Citizen Redeem      (Facade + Validator + StockAlert)"));
            System.out.println();
            System.out.println(Colors.bold("  -- [ABSTRACT FACTORY] Switch Config --"));
            System.out.println(Colors.bold("  [A]  Regular Config       (max 10/redeem, alert at 5 stock)"));
            System.out.println(Colors.bold("  [B]  Limited Edition Config (max 1/redeem, 1.5x balance)"));
            System.out.println(Colors.bold("  [0]  Back to Main Menu"));
            System.out.printf(Colors.cyan("\n  [Citizen Points: %s pts]%n"), citizenPoints);
            System.out.print(Colors.cyan("  > Choice: "));

            switch (sc.nextLine().trim().toUpperCase()) {
                case "1" -> showItems(rewardItemService.getAllItems(), "All Items");
                case "2" -> showItems(rewardItemService.getActiveItems(), "Active Items");
                case "3" -> showItems(rewardItemService.getAvailableItems(), "Available Items");
                case "4" -> createItemFlow(sc);
                case "5" -> updateItemFlow(sc);
                case "6" -> toggleFlow(sc, true);
                case "7" -> toggleFlow(sc, false);
                case "8" -> deleteItemFlow(sc);
                case "9" -> redeemFlow(sc);
                case "A" -> switchFactory(new RegularItemConfigFactory());
                case "B" -> switchFactory(new LimitedEditionConfigFactory());
                case "0" -> running = false;
                default -> ConsoleUtils.printError("Invalid!");
            }
        }
    }

    private void switchFactory(ItemConfigFactory factory) {
        System.out.println();
        ConsoleUtils.printWarning("[Abstract Factory] Switching to: " + factory.getFactoryName());
        applyFactory(factory);
        ConsoleUtils.printSuccess("Config applied! Rules:");
        System.out.println("     Stock Policy    : " + factory.createStockPolicy().describe());
        System.out.println("     Redeem Validator: " + factory.createRedeemValidator().describe());
        ConsoleUtils.pressEnter();
    }

    private void printCurrentConfig() {
        System.out.println();
        System.out.println("  " + Colors.yellow("[Factory: " + currentFactory.getFactoryName() + "]"));
        System.out.println("  " + Colors.purple("[Decorators: LoggingItemServiceDecorator]"));
    }

    private void showItems(List<RewardItem> items, String title) {
        ConsoleUtils.printSubHeader(title + " (" + items.size() + " items)");
        if (items.isEmpty()) {
            ConsoleUtils.printInfo("No items.");
            ConsoleUtils.pressEnter();
            return;
        }
        System.out.printf("  %-10s %-22s %-10s %-8s %-10s%n",
                Colors.bold("Item ID"), Colors.bold("Name"),
                Colors.bold("Points"), Colors.bold("Stock"), Colors.bold("Status"));
        ConsoleUtils.printSeparator();
        for (RewardItem item : items) {
            String statusTxt = item.isActive() ? Colors.green("ACTIVE") : Colors.red("INACTIVE");
            String stockTxt = item.getStock() > 10 ? Colors.green(String.valueOf(item.getStock()))
                    : item.getStock() > 0 ? Colors.yellow(String.valueOf(item.getStock()))
                            : Colors.red("OUT");
            System.out.printf("  %-10s %-22s %-10s %-8s %s%n",
                    item.getItemId().toString().substring(0, 8),
                    truncate(item.getName(), 20), item.getPointsCost() + " pts",
                    stockTxt, statusTxt);
        }
        ConsoleUtils.pressEnter();
    }

    private void createItemFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Create Item (Logging active)");
        System.out.print("  Name: ");
        String name = sc.nextLine().trim();
        System.out.print("  Description: ");
        String desc = sc.nextLine().trim();
        System.out.print("  Points: ");
        try {
            int pts = Integer.parseInt(sc.nextLine().trim());
            System.out.print("  Stock: ");
            int stock = Integer.parseInt(sc.nextLine().trim());
            RewardItem item = rewardItemService.createItem(name, desc, pts, stock, "img.jpg");
            ConsoleUtils.printSuccess("Created: " + name + " | ID=" + item.getItemId().toString().substring(0, 8));
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void updateItemFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Update Item (Logging active)");
        showItemsSilent();
        System.out.print("  Item ID prefix: ");
        RewardItem item = findByPrefix(sc.nextLine().trim());
        if (item == null)
            return;
        System.out.print("  New points [" + item.getPointsCost() + "]: ");
        String pi = sc.nextLine().trim();
        System.out.print("  New stock  [" + item.getStock() + "]: ");
        String si = sc.nextLine().trim();
        try {
            int pts = pi.isEmpty() ? item.getPointsCost() : Integer.parseInt(pi);
            int stock = si.isEmpty() ? item.getStock() : Integer.parseInt(si);
            rewardItemService.updateItem(item.getItemId(), item.getName(), item.getDescription(),
                    pts, stock, item.getImageUrl());
            ConsoleUtils.printSuccess("Updated: " + item.getName());
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void toggleFlow(Scanner sc, boolean activate) {
        ConsoleUtils.printSubHeader(activate ? "Activate Item" : "Deactivate Item");
        showItemsSilent();
        System.out.print("  Item ID prefix: ");
        RewardItem item = findByPrefix(sc.nextLine().trim());
        if (item == null)
            return;
        try {
            if (activate)
                rewardItemService.activateItem(item.getItemId());
            else
                rewardItemService.deactivateItem(item.getItemId());
            ConsoleUtils.printSuccess((activate ? "Activated" : "Deactivated") + ": " + item.getName());
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void deleteItemFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Delete Item (Logging active)");
        showItemsSilent();
        System.out.print("  Item ID prefix: ");
        RewardItem item = findByPrefix(sc.nextLine().trim());
        if (item == null)
            return;
        System.out.print("  Confirm delete \"" + item.getName() + "\"? (y/N): ");
        if ("y".equalsIgnoreCase(sc.nextLine().trim())) {
            try {
                rewardItemService.deleteItem(item.getItemId());
                ConsoleUtils.printSuccess("Deleted: " + item.getName());
            } catch (Exception e) {
                ConsoleUtils.printError(e.getMessage());
            }
        } else {
            ConsoleUtils.printWarning("Delete cancelled.");
        }
        ConsoleUtils.pressEnter();
    }

    private void redeemFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Redeem (Facade + Factory Validator + StockAlert active)");
        ConsoleUtils.printInfo("Citizen points: " + Colors.bold(citizenPoints + " pts"));
        showItems(rewardItemService.getAvailableItems(), "Available Items");
        System.out.print("  Item ID prefix to redeem: ");
        RewardItem item = findByPrefix(sc.nextLine().trim());
        if (item == null)
            return;
        try {
            rewardItemService.redeemItem(UUID.randomUUID(), item.getItemId(), citizenPoints);
            citizenPoints -= item.getPointsCost();
            ConsoleUtils.printSuccess("Redeemed: " + item.getName()
                    + " | Remaining points: " + citizenPoints + " pts");
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void showItemsSilent() {
        rewardItemService.getAllItems().forEach(i -> System.out.printf("  %-10s %-22s %-10s %s%n",
                i.getItemId().toString().substring(0, 8), truncate(i.getName(), 20),
                i.getPointsCost() + " pts",
                i.isActive() ? Colors.green("ACTIVE") : Colors.red("INACTIVE")));
    }

    private RewardItem findByPrefix(String prefix) {
        RewardItem i = rewardItemService.getAllItems().stream()
                .filter(x -> x.getItemId().toString().startsWith(prefix))
                .findFirst().orElse(null);
        if (i == null) {
            ConsoleUtils.printError("Item not found!");
            ConsoleUtils.pressEnter();
        }
        return i;
    }

    private String truncate(String s, int max) {
        return (s != null && s.length() > max) ? s.substring(0, max - 2) + ".." : s;
    }
}
