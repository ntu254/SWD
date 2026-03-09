package demo.uc12;

import demo.common.Colors;
import demo.common.ConsoleUtils;
import demo.uc12.config.*;
import demo.uc12.decorator.AuditTaskServiceDecorator;
import demo.uc12.decorator.LoggingTaskServiceDecorator;
import demo.uc12.entity.*;
import demo.uc12.service.TaskService;
import demo.uc12.service.TaskServiceImpl;

import java.time.LocalDate;
import java.util.List;
import java.util.Scanner;
import java.util.UUID;

/**
 * UC-12: Assign Task to Collector
 * Actor: Enterprise
 *
 * Patterns demonstrated:
 * - Abstract Factory : TaskConfigFactory (Standard/Strict)
 * creates TaskValidator + AssignmentRule
 * - Decorator : LoggingTaskServiceDecorator + AuditTaskServiceDecorator
 * - State : TaskStatus / TaskAssignmentStatus transitions
 * - Template Method : TaskAssignment auto-sets assignedAt
 */
public class UC12_AssignTask {

    private TaskService taskService;
    private AuditTaskServiceDecorator auditDecorator;
    private TaskConfigFactory currentFactory;

    private final UUID COLLECTOR_1 = UUID.fromString("22222222-0000-0000-0000-000000000001");
    private final UUID COLLECTOR_2 = UUID.fromString("22222222-0000-0000-0000-000000000002");
    private final UUID COLLECTOR_3 = UUID.fromString("22222222-0000-0000-0000-000000000003");

    public UC12_AssignTask() {
        applyFactory(new StandardTaskConfigFactory());
        seedData();
    }

    /**
     * Abstract Factory + Decorator assembly point.
     * Factory -> TaskServiceImpl (products injected).
     * Decorator chain: core -> logging -> audit (outermost = first called).
     */
    private void applyFactory(TaskConfigFactory factory) {
        this.currentFactory = factory;
        TaskService core = new TaskServiceImpl(factory);
        TaskService withLog = new LoggingTaskServiceDecorator(core);
        this.auditDecorator = new AuditTaskServiceDecorator(withLog);
        this.taskService = auditDecorator;
    }

    private void seedData() {
        try {
            taskService.createTask("Green Env Company", "District 1 - HCM",
                    "Collect organic waste at Ben Thanh market", LocalDate.now(), "HIGH");
            taskService.createTask("Green Env Company", "District 3 - HCM",
                    "Pick recyclable waste in residential zones", LocalDate.now().plusDays(1), "NORMAL");
            taskService.createTask("Clean City Co.", "Binh Thanh - HCM",
                    "Collect hazardous waste from hospital units", LocalDate.now(), "URGENT");
        } catch (Exception e) {
            System.out.println("  [!]   Seed error: " + e.getMessage());
        }
    }

    public void run(Scanner sc) {
        boolean running = true;
        while (running) {
            ConsoleUtils.printHeader("UC-12 | ASSIGN TASK TO COLLECTOR | Actor: Enterprise");
            printCurrentConfig();
            System.out.println();
            System.out.println(Colors.bold("  [1]  View all Tasks"));
            System.out.println(Colors.bold("  [2]  Assign Task to Collector"));
            System.out.println(Colors.bold("  [3]  Collector Accept Assignment"));
            System.out.println(Colors.bold("  [4]  Collector Reject Assignment"));
            System.out.println(Colors.bold("  [5]  Complete Assignment"));
            System.out.println(Colors.bold("  [6]  View Collector Assignments"));
            System.out.println(Colors.bold("  [7]  View Audit Trail (Decorator)"));
            System.out.println();
            System.out.println(Colors.bold("  -- [ABSTRACT FACTORY] Switch Config --"));
            System.out.println(Colors.bold("  [8]  Standard Config (any priority, desc >= 5 chars)"));
            System.out.println(Colors.bold("  [9]  Strict Config   (HIGH/URGENT only, desc >= 15 chars)"));
            System.out.println(Colors.bold("  [0]  Back to Main Menu"));
            System.out.print(Colors.cyan("\n  > Choice: "));

            switch (sc.nextLine().trim()) {
                case "1" -> showAllTasks();
                case "2" -> assignTaskFlow(sc);
                case "3" -> acceptFlow(sc);
                case "4" -> rejectFlow(sc);
                case "5" -> completeFlow(sc);
                case "6" -> showCollectorAssignments(sc);
                case "7" -> {
                    auditDecorator.printAuditLog();
                    ConsoleUtils.pressEnter();
                }
                case "8" -> switchFactory(new StandardTaskConfigFactory());
                case "9" -> switchFactory(new StrictTaskConfigFactory());
                case "0" -> running = false;
                default -> ConsoleUtils.printError("Invalid choice!");
            }
        }
    }

    private void switchFactory(TaskConfigFactory factory) {
        System.out.println();
        ConsoleUtils.printWarning("[Abstract Factory] Switching to: " + factory.getFactoryName());
        applyFactory(factory);
        ConsoleUtils.printSuccess("Config applied! Rules:");
        System.out.println("     Validator      : " + factory.createTaskValidator().describe());
        System.out.println("     Assignment Rule: " + factory.createAssignmentRule().describe());
        ConsoleUtils.pressEnter();
    }

    private void printCurrentConfig() {
        System.out.println();
        System.out.println("  " + Colors.yellow("[Factory: " + currentFactory.getFactoryName() + "]"));
        System.out.println("  " + Colors.purple("[Decorators: Logging + AuditTrail]"));
    }

    private void showAllTasks() {
        ConsoleUtils.printSubHeader("All Tasks");
        List<Task> tasks = taskService.getAllTasks();
        if (tasks.isEmpty()) {
            ConsoleUtils.printInfo("No tasks.");
            ConsoleUtils.pressEnter();
            return;
        }
        System.out.printf("  %-10s %-35s %-12s %-10s %-12s%n",
                Colors.bold("Task ID"), Colors.bold("Description"),
                Colors.bold("Area"), Colors.bold("Priority"), Colors.bold("Status"));
        ConsoleUtils.printSeparator();
        for (Task t : tasks)
            System.out.printf("  %-10s %-35s %-12s %-10s %s%n",
                    t.getTaskId().toString().substring(0, 8),
                    truncate(t.getDescription(), 33), truncate(t.getAreaName(), 10),
                    t.getPriority(), statusColor(t.getStatus()));
        ConsoleUtils.pressEnter();
    }

    private void assignTaskFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Assign Task (Logging Decorator + Validation)");
        showTasksSilent();
        System.out.print("  Enter first 8 chars of Task ID: ");
        String pref = sc.nextLine().trim();
        Task task = taskService.getAllTasks().stream()
                .filter(t -> t.getTaskId().toString().startsWith(pref)).findFirst().orElse(null);
        if (task == null) {
            ConsoleUtils.printError("Task not found!");
            ConsoleUtils.pressEnter();
            return;
        }

        System.out.println("\n  Select Collector:");
        System.out.println("    [1] Tran Van Dung   [2] Nguyen Thi Hoa   [3] Pham Van Khoa");
        System.out.print("  Choice: ");
        UUID uid;
        String cname;
        switch (sc.nextLine().trim()) {
            case "1" -> {
                uid = COLLECTOR_1;
                cname = "Tran Van Dung";
            }
            case "2" -> {
                uid = COLLECTOR_2;
                cname = "Nguyen Thi Hoa";
            }
            case "3" -> {
                uid = COLLECTOR_3;
                cname = "Pham Van Khoa";
            }
            default -> {
                ConsoleUtils.printError("Invalid");
                ConsoleUtils.pressEnter();
                return;
            }
        }
        try {
            TaskAssignment a = taskService.assignTask(task.getTaskId(), uid, cname);
            ConsoleUtils.printSuccess("Assigned to " + cname + " | Assignment="
                    + a.getAssignmentId().toString().substring(0, 8));
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void acceptFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Accept Assignment");
        showAssignmentsSilent();
        System.out.print("  Enter first 8 chars of Assignment ID: ");
        TaskAssignment a = findAssignmentByPrefix(sc.nextLine().trim());
        if (a == null)
            return;
        try {
            taskService.acceptAssignment(a.getAssignmentId());
            ConsoleUtils.printSuccess(a.getCollectorName() + " accepted the task!");
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void rejectFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Reject Assignment");
        showAssignmentsSilent();
        System.out.print("  Assignment ID prefix: ");
        TaskAssignment a = findAssignmentByPrefix(sc.nextLine().trim());
        if (a == null)
            return;
        System.out.print("  Rejection reason: ");
        String reason = sc.nextLine().trim();
        try {
            taskService.rejectAssignment(a.getAssignmentId(), reason);
            ConsoleUtils.printWarning(a.getCollectorName() + " rejected. Task reverted to PENDING.");
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void completeFlow(Scanner sc) {
        ConsoleUtils.printSubHeader("Complete Assignment");
        showAssignmentsSilent();
        System.out.print("  Assignment ID prefix: ");
        TaskAssignment a = findAssignmentByPrefix(sc.nextLine().trim());
        if (a == null)
            return;
        try {
            taskService.completeAssignment(a.getAssignmentId());
            ConsoleUtils.printSuccess("Task completed by " + a.getCollectorName());
        } catch (Exception e) {
            ConsoleUtils.printError(e.getMessage());
        }
        ConsoleUtils.pressEnter();
    }

    private void showCollectorAssignments(Scanner sc) {
        System.out.println("  [1] Tran Van Dung   [2] Nguyen Thi Hoa   [3] Pham Van Khoa");
        System.out.print("  Select: ");
        UUID uid;
        switch (sc.nextLine().trim()) {
            case "1" -> uid = COLLECTOR_1;
            case "2" -> uid = COLLECTOR_2;
            case "3" -> uid = COLLECTOR_3;
            default -> {
                ConsoleUtils.printError("Invalid");
                ConsoleUtils.pressEnter();
                return;
            }
        }
        List<TaskAssignment> list = taskService.getAssignmentsByCollector(uid);
        if (list.isEmpty()) {
            ConsoleUtils.printInfo("No assignments.");
            ConsoleUtils.pressEnter();
            return;
        }
        for (TaskAssignment a : list)
            System.out.printf("  %-10s %-30s %s%n",
                    a.getAssignmentId().toString().substring(0, 8),
                    truncate(a.getTask().getDescription(), 28),
                    statusColorA(a.getStatus()));
        ConsoleUtils.pressEnter();
    }

    private void showTasksSilent() {
        taskService.getAllTasks().forEach(t -> System.out.printf("  %-10s %-35s %s%n",
                t.getTaskId().toString().substring(0, 8),
                truncate(t.getDescription(), 33), statusColor(t.getStatus())));
    }

    private void showAssignmentsSilent() {
        List<TaskAssignment> list = taskService.getAllAssignments();
        if (list.isEmpty()) {
            System.out.println("  (no assignments)");
            return;
        }
        list.forEach(a -> System.out.printf("  %-10s %-18s %-25s %s%n",
                a.getAssignmentId().toString().substring(0, 8), a.getCollectorName(),
                truncate(a.getTask().getDescription(), 23), statusColorA(a.getStatus())));
    }

    private TaskAssignment findAssignmentByPrefix(String prefix) {
        TaskAssignment a = taskService.getAllAssignments().stream()
                .filter(x -> x.getAssignmentId().toString().startsWith(prefix))
                .findFirst().orElse(null);
        if (a == null) {
            ConsoleUtils.printError("Assignment not found!");
            ConsoleUtils.pressEnter();
        }
        return a;
    }

    private String statusColor(TaskStatus s) {
        return switch (s) {
            case PENDING -> Colors.yellow(s.name());
            case ASSIGNED -> Colors.blue(s.name());
            case IN_PROGRESS -> Colors.purple(s.name());
            case COLLECTED -> Colors.green(s.name());
            default -> Colors.red(s.name());
        };
    }

    private String statusColorA(TaskAssignmentStatus s) {
        return switch (s) {
            case ASSIGNED -> Colors.yellow(s.name());
            case ON_THE_WAY -> Colors.blue(s.name());
            case COLLECTED -> Colors.green(s.name());
            default -> Colors.red(s.name());
        };
    }

    private String truncate(String s, int max) {
        return (s != null && s.length() > max) ? s.substring(0, max - 2) + ".." : s;
    }
}
