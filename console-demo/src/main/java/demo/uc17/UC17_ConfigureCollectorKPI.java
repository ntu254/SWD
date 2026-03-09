package demo.uc17;

import demo.common.Colors;
import demo.common.ConsoleUtils;
import demo.uc17.config.*;
import demo.uc17.decorator.LoggingKpiServiceDecorator;
import demo.uc17.entity.CollectorKpiDaily;
import demo.uc17.entity.CollectorKpiStatus;
import demo.uc17.service.CollectorKpiService;
import demo.uc17.service.KpiService;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

/**
 * UC-17: Configure Collector KPI
 * Actor: Enterprise
 *
 * Patterns demonstrated:
 * - Abstract Factory : KpiConfigFactory (Standard/Generous)
 * creates BonusCalculator + KpiEvaluator
 * - Decorator : LoggingKpiServiceDecorator
 * - Observer (part.) : updateKpiAfterVisit() reacts to visit events
 * - Template Method : CollectorKpiDaily.isKpiMet()
 */
public class UC17_ConfigureCollectorKPI {

    private KpiService kpiService;
    private KpiConfigFactory currentFactory;

    private final UUID COLLECTOR_1 = UUID.fromString("22222222-0000-0000-0000-000000000001");
    private final UUID COLLECTOR_2 = UUID.fromString("22222222-0000-0000-0000-000000000002");
    private final UUID COLLECTOR_3 = UUID.fromString("22222222-0000-0000-0000-000000000003");
    private final LocalDate TODAY = LocalDate.now();

    public UC17_ConfigureCollectorKPI() {
        applyFactory(new StandardKpiConfigFactory());
        seedData();
    }

    /** Abstract Factory + Decorator assembly. */
    private void applyFactory(KpiConfigFactory factory) {
        this.currentFactory = factory;
        KpiService core = new CollectorKpiService(factory);
        this.kpiService = new LoggingKpiServiceDecorator(core);
    }

    private void seedData() {
        kpiService.setKpiTargets(COLLECTOR_1, "Tran Van Dung", "District 1 - HCM", TODAY, 60.0, 6);
        kpiService.setKpiTargets(COLLECTOR_2, "Nguyen Thi Hoa", "District 3 - HCM", TODAY, 40.0, 4);
        kpiService.setKpiTargets(COLLECTOR_3, "Pham Van Khoa", "Binh Thanh", TODAY, 50.0, 5);
        kpiService.updateKpiAfterVisit(COLLECTOR_1, "Tran Van Dung", "District 1 - HCM", TODAY, 12.5);
        kpiService.updateKpiAfterVisit(COLLECTOR_1, "Tran Van Dung", "District 1 - HCM", TODAY, 15.0);
        kpiService.updateKpiAfterVisit(COLLECTOR_1, "Tran Van Dung", "District 1 - HCM", TODAY, 10.0);
        kpiService.updateKpiAfterVisit(COLLECTOR_2, "Nguyen Thi Hoa", "District 3 - HCM", TODAY, 8.0);
        kpiService.updateKpiAfterVisit(COLLECTOR_2, "Nguyen Thi Hoa", "District 3 - HCM", TODAY, 12.0);
        kpiService.updateKpiAfterVisit(COLLECTOR_3, "Pham Van Khoa", "Binh Thanh", TODAY, 11.0);
    }

    public void run(Scanner sc) {
        boolean running = true;
        while (running) {
            ConsoleUtils.printHeader("UC-17 | CONFIGURE COLLECTOR KPI | Actor: Enterprise");
            printCurrentConfig();
            System.out.println();
            System.out.println(Colors.bold("  [1]  KPI Dashboard (Today)"));
            System.out.println(Colors.bold("  [2]  Set KPI Targets     (Logging Decorator)"));
            System.out.println(Colors.bold("  [3]  Simulate Visit      (Observer + Logging)"));
            System.out.println(Colors.bold("  [4]  Collector KPI Detail"));
            System.out.println(Colors.bold("  [5]  Finalize KPIs       (uses Factory BonusCalculator + KpiEvaluator)"));
            System.out.println();
            System.out.println(Colors.bold("  -- [ABSTRACT FACTORY] Switch Config --"));
            System.out.println(Colors.bold("  [6]  Standard KPI  (AND logic, 100 pts bonus)"));
            System.out.println(Colors.bold("  [7]  Generous KPI  (OR logic, 200+ pts bonus)"));
            System.out.println(Colors.bold("  [0]  Back to Main Menu"));
            System.out.print(Colors.cyan("\n  > Choice: "));

            switch (sc.nextLine().trim()) {
                case "1" -> showDashboard();
                case "2" -> configureKpiFlow(sc);
                case "3" -> simulateVisitFlow(sc);
                case "4" -> showCollectorDetail(sc);
                case "5" -> finalizeFlow(sc);
                case "6" -> switchFactory(new StandardKpiConfigFactory());
                case "7" -> switchFactory(new GenerousKpiConfigFactory());
                case "0" -> running = false;
                default -> ConsoleUtils.printError("Invalid choice!");
            }
        }
    }

    private void switchFactory(KpiConfigFactory factory) {
        System.out.println();
        ConsoleUtils.printWarning("[Abstract Factory] Switching to: " + factory.getFactoryName());
        applyFactory(factory);
        ConsoleUtils.printSuccess("Config applied! Rules:");
        System.out.println("     Bonus Calculator: " + factory.createBonusCalculator().describe());
        System.out.println("     KPI Evaluator   : " + factory.createKpiEvaluator().describe());
        ConsoleUtils.pressEnter();
    }

    private void printCurrentConfig() {
        System.out.println();
        System.out.println("  " + Colors.yellow("[Factory: " + currentFactory.getFactoryName() + "]"));
        System.out.println("  " + Colors.purple("[Decorators: LoggingKpiServiceDecorator]"));
    }

    private void showDashboard() {
        ConsoleUtils.printSubHeader("KPI Dashboard - " + TODAY);
        List<CollectorKpiDaily> kpis = kpiService.getKpisByDate(TODAY);
        if (kpis.isEmpty()) {
            ConsoleUtils.printInfo("No data.");
            ConsoleUtils.pressEnter();
            return;
        }
        System.out.printf("  %-18s %-18s %-28s %-24s %-12s%n",
                Colors.bold("Collector"), Colors.bold("Area"),
                Colors.bold("Weight"), Colors.bold("Visits"), Colors.bold("Status"));
        ConsoleUtils.printSeparator();
        for (CollectorKpiDaily kpi : kpis) {
            System.out.printf("  %-18s %-18s %-32s %-28s %s%n",
                    kpi.getCollectorName(), truncate(kpi.getAreaName(), 16),
                    progressBar(kpi.getWeightProgress())
                            + String.format(" %.1f/%.1fkg", kpi.getActualWeightKg(), kpi.getMinWeightKg()),
                    progressBar(kpi.getVisitsProgress())
                            + String.format(" %d/%d", kpi.getActualVisits(), kpi.getMinVisits()),
                    kpiStatusColor(kpi.getStatus()));
        }
        ConsoleUtils.pressEnter();
    }

    private void configureKpiFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Set KPI Targets (Logging active)");
        pickCollector(sc).ifPresent(parts -> {
            UUID uid = parts[0];
            String name = (String) parts[1];
            String area = (String) parts[2];
            ConsoleUtils.printInfo("Current KPI for " + name + ":");
            CollectorKpiDaily cur = kpiService.getKpi(uid, area, TODAY);
            if (cur != null)
                ConsoleUtils.printRow("Current targets",
                        cur.getMinWeightKg() + "kg / " + cur.getMinVisits() + " visits");
            System.out.print("  Min weight/day (kg): ");
            try {
                double w = Double.parseDouble(sc.nextLine().trim());
                System.out.print("  Min visits/day: ");
                int v = Integer.parseInt(sc.nextLine().trim());
                kpiService.setKpiTargets(uid, name, area, TODAY, w, v);
                ConsoleUtils.printSuccess("Targets set: " + w + "kg, " + v + " visits");
            } catch (Exception e) {
                ConsoleUtils.printError(e.getMessage());
            }
        });
        ConsoleUtils.pressEnter();
    }

    private void simulateVisitFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Simulate Collector Visit (Observer + Logging)");
        pickCollector(sc).ifPresent(parts -> {
            UUID uid = parts[0];
            String name = (String) parts[1];
            String area = (String) parts[2];
            System.out.print("  Collected weight (kg): ");
            try {
                double w = Double.parseDouble(sc.nextLine().trim());
                kpiService.updateKpiAfterVisit(uid, name, area, TODAY, w);
                CollectorKpiDaily kpi = kpiService.getKpi(uid, area, TODAY);
                if (kpi != null) {
                    System.out.println();
                    ConsoleUtils.printRow("Weight",
                            String.format("%.1f / %.1fkg", kpi.getActualWeightKg(), kpi.getMinWeightKg()));
                    ConsoleUtils.printRow("Visits", kpi.getActualVisits() + " / " + kpi.getMinVisits());
                    ConsoleUtils.printRow("Status", kpiStatusColor(kpi.getStatus()));
                }
            } catch (Exception e) {
                ConsoleUtils.printError(e.getMessage());
            }
        });
        ConsoleUtils.pressEnter();
    }

    private void showCollectorDetail(Scanner sc) {
        ConsoleUtils.printSubHeader("Collector Detail");
        pickCollector(sc).ifPresent(parts -> {
            UUID uid = parts[0];
            kpiService.getKpisByCollector(uid).forEach(kpi -> {
                ConsoleUtils.printRow("Collector", kpi.getCollectorName());
                ConsoleUtils.printRow("Area", kpi.getAreaName());
                ConsoleUtils.printRow("Weight",
                        String.format("%.1f/%.1fkg", kpi.getActualWeightKg(), kpi.getMinWeightKg()));
                ConsoleUtils.printRow("Visits", kpi.getActualVisits() + "/" + kpi.getMinVisits());
                ConsoleUtils.printRow("Weight %",
                        progressBar(kpi.getWeightProgress()) + String.format(" %.0f%%", kpi.getWeightProgress()));
                ConsoleUtils.printRow("Visits %",
                        progressBar(kpi.getVisitsProgress()) + String.format(" %.0f%%", kpi.getVisitsProgress()));
                ConsoleUtils.printRow("Status", kpiStatusColor(kpi.getStatus()));
                ConsoleUtils.printSeparator();
            });
        });
        ConsoleUtils.pressEnter();
    }

    private void finalizeFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Finalize KPIs (Factory BonusCalculator + KpiEvaluator)");
        ConsoleUtils.printInfo("Evaluator: " + currentFactory.createKpiEvaluator().describe());
        ConsoleUtils.printInfo("Bonus    : " + currentFactory.createBonusCalculator().describe());
        System.out.print("  Press Enter to finalize for " + TODAY + ": ");
        sc.nextLine();
        kpiService.finalizeKpisForDate(TODAY);
        System.out.println();
        showDashboard();
    }

    /** Returns Optional-like array: [UUID, name, area]. */
    @SuppressWarnings("unchecked")
    private java.util.Optional<Object[]> pickCollector(Scanner sc) {
        System.out.println("  [1] Tran Van Dung    [2] Nguyen Thi Hoa    [3] Pham Van Khoa");
        System.out.print("  Select: ");
        return switch (sc.nextLine().trim()) {
            case "1" -> java.util.Optional.of(new Object[] { COLLECTOR_1, "Tran Van Dung", "District 1 - HCM" });
            case "2" -> java.util.Optional.of(new Object[] { COLLECTOR_2, "Nguyen Thi Hoa", "District 3 - HCM" });
            case "3" -> java.util.Optional.of(new Object[] { COLLECTOR_3, "Pham Van Khoa", "Binh Thanh" });
            default -> {
                ConsoleUtils.printError("Invalid");
                yield java.util.Optional.empty();
            }
        };
    }

    private String progressBar(double percent) {
        int filled = Math.min((int) (percent / 10), 10);
        StringBuilder bar = new StringBuilder("[");
        for (int i = 0; i < 10; i++)
            bar.append(i < filled ? Colors.GREEN + "#" + Colors.RESET : Colors.RED + "." + Colors.RESET);
        bar.append("]");
        return bar.toString();
    }

    private String kpiStatusColor(CollectorKpiStatus s) {
        return switch (s) {
            case PENDING -> Colors.yellow("[PENDING]");
            case MET -> Colors.green("[MET]");
            case NOT_MET -> Colors.red("[NOT MET]");
        };
    }

    private String truncate(String s, int max) {
        return (s != null && s.length() > max) ? s.substring(0, max - 2) + ".." : s;
    }
}
