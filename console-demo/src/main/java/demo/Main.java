package demo;

import demo.common.Colors;
import demo.common.ConsoleUtils;
import demo.uc05.UC05_ViewRewardPoints;
import demo.uc12.UC12_AssignTask;
import demo.uc17.UC17_ConfigureCollectorKPI;
import demo.uc29.UC29_ManageRewardItems;

import java.util.Scanner;

/**
 * ============================================================
 * CONSOLE DEMO - Waste Management System
 * UC-05 | UC-12 | UC-29 | UC-17
 * ============================================================
 *
 * Design Patterns applied:
 *
 * [CREATIONAL]
 * Abstract Factory : RewardConfigFactory (Standard/BonusEvent/VIP)
 * -> PointMultiplier + RedemptionPolicy
 * Builder : Object construction (RewardTransaction, Task)
 *
 * [STRUCTURAL]
 * Decorator : RewardServiceDecorator chain
 * -> LoggingRewardServiceDecorator
 * -> MaxPointsValidationDecorator
 * Facade : RewardItemServiceImpl.redeemItem()
 *
 * [BEHAVIORAL]
 * Strategy : RewardService, TaskService, RewardItemService (interfaces)
 * Repository : In-memory data stores
 * State : TaskStatus, TaskAssignmentStatus, CollectorKpiStatus
 * Observer (part.) : CollectorKpiService.updateKpiAfterVisit()
 * Template Method : CollectorKpiDaily.isKpiMet(), TaskAssignment auto-sets
 * assignedAt
 * Delegation : RewardItemServiceImpl -> RewardService (point deduction)
 */
public class Main {

        public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);

                UC05_ViewRewardPoints uc05 = new UC05_ViewRewardPoints();
                UC12_AssignTask uc12 = new UC12_AssignTask();
                UC29_ManageRewardItems uc29 = new UC29_ManageRewardItems();
                UC17_ConfigureCollectorKPI uc17 = new UC17_ConfigureCollectorKPI();

                boolean running = true;
                while (running) {
                        printMainMenu();
                        System.out.print(Colors.cyan("\n  > Choice: "));
                        String choice = sc.nextLine().trim();

                        switch (choice) {
                                case "1" -> uc05.run(sc);
                                case "2" -> uc12.run(sc);
                                case "3" -> uc29.run(sc);
                                case "4" -> uc17.run(sc);
                                case "0" -> {
                                        System.out.println();
                                        ConsoleUtils.printSuccess("Exit program. Goodbye!");
                                        System.out.println();
                                        running = false;
                                }
                                default -> ConsoleUtils.printError("Invalid choice! Enter 0-4.");
                        }
                }
                sc.close();
        }

        private static void printMainMenu() {
                String border = Colors.CYAN + Colors.BOLD + "  " + "=".repeat(62) + Colors.RESET;
                System.out.println();
                System.out.println(border);
                System.out.printf(Colors.CYAN + Colors.BOLD + "  | %-58s |%n" + Colors.RESET,
                                "   WASTE MANAGEMENT SYSTEM - CONSOLE DEMO");
                System.out.printf(Colors.CYAN + Colors.BOLD + "  | %-58s |%n" + Colors.RESET,
                                "   Patterns: AbstractFactory, Decorator, Strategy, State...");
                System.out.println(border);
                System.out.println();

                System.out.printf("  %s  UC-05  View Reward Points%n", Colors.bold("[1]"));
                System.out.printf("        %s%n", Colors.yellow("Actor: Citizen"));
                System.out.printf("        %s%n",
                                Colors.purple("[AbstractFactory] RewardConfigFactory (Standard/BonusEvent/VIP)"));
                System.out.printf("        %s%n",
                                Colors.purple("[Decorator]       LoggingDecorator + MaxPointsValidationDecorator"));
                System.out.println();

                System.out.printf("  %s  UC-12  Assign Task to Collector%n", Colors.bold("[2]"));
                System.out.printf("        %s%n", Colors.yellow("Actor: Enterprise"));
                System.out.printf("        %s%n",
                                Colors.purple("[State]    TaskStatus / TaskAssignmentStatus enum transitions"));
                System.out.printf("        %s%n",
                                Colors.purple("[Template] TaskAssignment auto-sets assignedAt on construction"));
                System.out.println();

                System.out.printf("  %s  UC-29  Manage Reward Items%n", Colors.bold("[3]"));
                System.out.printf("        %s%n", Colors.yellow("Actor: Administrator"));
                System.out.printf("        %s%n",
                                Colors.purple("[Facade]     redeemItem() hides: active check + stock + points"));
                System.out.printf("        %s%n",
                                Colors.purple("[Delegation] RewardItemService -> RewardService for point deduct"));
                System.out.println();

                System.out.printf("  %s  UC-17  Configure Collector KPI%n", Colors.bold("[4]"));
                System.out.printf("        %s%n", Colors.yellow("Actor: Enterprise"));
                System.out.printf("        %s%n",
                                Colors.purple("[Observer]  updateKpiAfterVisit() reacts to visit events"));
                System.out.printf("        %s%n",
                                Colors.purple("[Template]  CollectorKpiDaily.isKpiMet() encapsulates logic"));
                System.out.println();

                System.out.printf("  %s  Exit%n", Colors.bold("[0]"));
                System.out.println();
        }
}
