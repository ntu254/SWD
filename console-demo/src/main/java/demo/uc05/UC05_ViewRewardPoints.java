package demo.uc05;

import demo.common.Colors;
import demo.common.ConsoleUtils;
import demo.uc05.config.*;
import demo.uc05.decorator.LoggingRewardServiceDecorator;
import demo.uc05.decorator.MaxPointsValidationDecorator;
import demo.uc05.entity.RewardTransaction;
import demo.uc05.repository.RewardTransactionRepository;
import demo.uc05.service.RewardService;
import demo.uc05.service.RewardServiceImpl;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

/**
 * UC-05: View Reward Points
 * Actor: Citizen
 *
 * Patterns demonstrated:
 * - Abstract Factory : choose RewardConfigFactory (Standard/BonusEvent/VIP)
 * - Decorator : chain LoggingDecorator + MaxPointsValidationDecorator
 * - Strategy : RewardService interface (service selection)
 * - Repository : RewardTransactionRepository (in-memory)
 */
public class UC05_ViewRewardPoints {

    private RewardService rewardService;
    private RewardConfigFactory currentFactory;
    private final RewardTransactionRepository repo;
    private final DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final UUID CITIZEN_A = UUID.fromString("11111111-0000-0000-0000-000000000001");
    private final UUID CITIZEN_B = UUID.fromString("11111111-0000-0000-0000-000000000002");
    private final UUID CITIZEN_C = UUID.fromString("11111111-0000-0000-0000-000000000003");

    public UC05_ViewRewardPoints() {
        this.repo = new RewardTransactionRepository();
        // Default: Standard factory + full decorator chain
        applyFactory(new StandardRewardConfigFactory(), true, true);
        seedData();
    }

    public RewardService getRewardService() {
        return rewardService;
    }

    /**
     * Abstract Factory + Decorator assembly point.
     * Factory creates PointMultiplier & RedemptionPolicy.
     * Decorators wrap the core service to add logging & validation.
     */
    private void applyFactory(RewardConfigFactory factory,
            boolean enableLogging,
            boolean enableValidation) {
        this.currentFactory = factory;
        // Core service (uses Abstract Factory products internally)
        RewardService core = new RewardServiceImpl(repo, factory);
        // Decorator chain: core -> validation -> logging (outermost = first called)
        if (enableValidation)
            core = new MaxPointsValidationDecorator(core);
        if (enableLogging)
            core = new LoggingRewardServiceDecorator(core);
        this.rewardService = core;
    }

    private void seedData() {
        // Seed via service so decorators/factory ARE applied to seed data too
        rewardService.earnPoints(CITIZEN_A, "Nguyen Van An", 120, "COLLECTION");
        rewardService.earnPoints(CITIZEN_A, "Nguyen Van An", 50, "BONUS");
        rewardService.earnPoints(CITIZEN_B, "Tran Thi Binh", 180, "COLLECTION");
        rewardService.earnPoints(CITIZEN_B, "Tran Thi Binh", 40, "COLLECTION");
        rewardService.earnPoints(CITIZEN_C, "Le Van Cuong", 200, "COLLECTION");
    }

    public void run(Scanner sc) {
        boolean running = true;
        while (running) {
            ConsoleUtils.printHeader("UC-05 | VIEW REWARD POINTS | Actor: Citizen");
            printCurrentConfig();
            System.out.println();
            System.out.println(Colors.bold("  -- Citizen --"));
            System.out.println("    [1] Nguyen Van An");
            System.out.println("    [2] Tran Thi Binh");
            System.out.println("    [3] Le Van Cuong");
            System.out.println();
            System.out.println(Colors.bold("  -- Functions --"));
            System.out.println("    [4] View Leaderboard");
            System.out.println("    [5] Add Points (triggers Logging Decorator)");
            System.out.println("    [6] Redeem Points (triggers Validation + Logging)");
            System.out.println();
            System.out.println(Colors.bold("  -- [ABSTRACT FACTORY] Switch Config --"));
            System.out.println("    [7] Switch to Standard Config  (x1.0, strict)");
            System.out.println("    [8] Switch to Bonus Event      (x2.0, relaxed)");
            System.out.println("    [9] Switch to VIP Config       (x3.0, no limits)");
            System.out.println("    [0] Back to Main Menu");
            System.out.print(Colors.cyan("\n  > Choice: "));

            String choice = sc.nextLine().trim();
            UUID selected = null;
            String name = null;

            switch (choice) {
                case "1" -> {
                    selected = CITIZEN_A;
                    name = "Nguyen Van An";
                }
                case "2" -> {
                    selected = CITIZEN_B;
                    name = "Tran Thi Binh";
                }
                case "3" -> {
                    selected = CITIZEN_C;
                    name = "Le Van Cuong";
                }
                case "4" -> {
                    showLeaderboard();
                    continue;
                }
                case "5" -> {
                    earnPointsFlow(sc);
                    continue;
                }
                case "6" -> {
                    redeemFlow(sc);
                    continue;
                }
                case "7" -> {
                    switchFactory(new StandardRewardConfigFactory());
                    continue;
                }
                case "8" -> {
                    switchFactory(new BonusEventConfigFactory());
                    continue;
                }
                case "9" -> {
                    switchFactory(new VipRewardConfigFactory());
                    continue;
                }
                case "0" -> {
                    running = false;
                    continue;
                }
                default -> {
                    ConsoleUtils.printError("Invalid choice!");
                    continue;
                }
            }
            showCitizenProfile(selected, name);
        }
    }

    /** Switching factory rebuilds the decorator chain with new products. */
    private void switchFactory(RewardConfigFactory factory) {
        System.out.println();
        ConsoleUtils.printWarning("[Abstract Factory] Switching to: " + factory.getFactoryName());
        applyFactory(factory, true, true);
        ConsoleUtils.printSuccess("Config applied! New rules:");
        // Read products directly from factory (no need to unwrap decorators)
        System.out.println("     Multiplier : " + factory.createPointMultiplier().describe());
        System.out.println("     Policy     : " + factory.createRedemptionPolicy().describe());
        ConsoleUtils.pressEnter();
    }

    private void printCurrentConfig() {
        String factor = Colors.yellow("[Factory: " + currentFactory.getFactoryName() + "]");
        String decs = Colors.purple("[Decorators: Logging + MaxPointsValidation]");
        System.out.println();
        System.out.println("  " + factor);
        System.out.println("  " + decs);
    }

    private void showCitizenProfile(UUID citizenId, String name) {
        ConsoleUtils.printSubHeader("Points Info - " + name);
        int balance = rewardService.getPoints(citizenId);
        System.out.println();
        ConsoleUtils.printRow("Citizen", name);
        ConsoleUtils.printRow("Current Points",
                Colors.GREEN + Colors.BOLD + balance + " pts" + Colors.RESET);
        ConsoleUtils.printSeparator();
        ConsoleUtils.printSubHeader("Transaction History");
        List<RewardTransaction> history = rewardService.getTransactionHistory(citizenId);
        if (history.isEmpty()) {
            ConsoleUtils.printInfo("No transactions found.");
        } else {
            System.out.printf("     %-22s %-15s %s%n",
                    Colors.bold("Time"), Colors.bold("Reason"), Colors.bold("Points"));
            System.out.println("     " + "-".repeat(52));
            for (RewardTransaction tx : history) {
                String delta = tx.getPointsDelta() >= 0
                        ? Colors.GREEN + String.format("+%.0f pts", tx.getPointsDelta()) + Colors.RESET
                        : Colors.RED + String.format("%.0f pts", tx.getPointsDelta()) + Colors.RESET;
                System.out.printf("     %-22s %-15s %s%n",
                        tx.getCreatedAt().format(fmt), tx.getReasonCode(), delta);
            }
        }
        ConsoleUtils.pressEnter();
    }

    private void showLeaderboard() {
        ConsoleUtils.printHeader("UC-05 | LEADERBOARD");
        System.out.println();
        rewardService.showLeaderboard(10);
        ConsoleUtils.pressEnter();
    }

    private void earnPointsFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Add Points (Logging Decorator active)");
        System.out.print("  Citizen name: ");
        String nm = sc.nextLine().trim();
        System.out.print("  Base points to earn: ");
        try {
            int base = Integer.parseInt(sc.nextLine().trim());
            UUID tempId = UUID.randomUUID();
            RewardTransaction tx = rewardService.earnPoints(tempId, nm, base, "COLLECTION");
            int actual = (int) tx.getPointsDelta();
            ConsoleUtils.printSuccess("Earned " + actual + " pts"
                    + (actual != base ? " (base=" + base + " -> after multiplier=" + actual + ")" : "")
                    + " | TX: " + tx.getTransactionId().toString().substring(0, 8));
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void redeemFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Redeem Points (Validation + Logging Decorators active)");
        System.out.println("  [1] Nguyen Van An   [2] Tran Thi Binh   [3] Le Van Cuong");
        System.out.print("  Select Citizen: ");
        UUID uid;
        String nm;
        switch (sc.nextLine().trim()) {
            case "1" -> {
                uid = CITIZEN_A;
                nm = "Nguyen Van An";
            }
            case "2" -> {
                uid = CITIZEN_B;
                nm = "Tran Thi Binh";
            }
            case "3" -> {
                uid = CITIZEN_C;
                nm = "Le Van Cuong";
            }
            default -> {
                ConsoleUtils.printError("Invalid");
                ConsoleUtils.pressEnter();
                return;
            }
        }
        ConsoleUtils.printInfo("Current balance: " + rewardService.getPoints(uid) + " pts");
        System.out.print("  Points to redeem: ");
        try {
            int pts = Integer.parseInt(sc.nextLine().trim());
            rewardService.redeemPoints(uid, nm, pts);
            ConsoleUtils.printSuccess("Redeemed " + pts + " pts from " + nm
                    + " | New balance: " + rewardService.getPoints(uid) + " pts");
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }
}
