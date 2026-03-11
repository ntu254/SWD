package com.example.demo.runner;

import com.example.demo.data.SampleData;
import com.example.demo.decorator.*;
import com.example.demo.factory.*;
import com.example.demo.service.ComplaintService;
import com.example.demo.service.ReportService;
import com.example.demo.service.TaskService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Scanner;

@Component
public class ConsoleAppRunner implements CommandLineRunner {

    private final SampleData sampleData;
    private final Scanner scanner = new Scanner(System.in);

    // CRUD services
    private final ReportService reportService;
    private final ComplaintService complaintService;
    private final TaskService taskService;

    public ConsoleAppRunner(SampleData sampleData) {
        this.sampleData = sampleData;
        this.reportService = new ReportService(sampleData, scanner);
        this.complaintService = new ComplaintService(sampleData, scanner);
        this.taskService = new TaskService(sampleData, scanner);
    }

    @Override
    public void run(String... args) {
        boolean running = true;
        while (running) {
            printMainMenu();
            String choice = scanner.nextLine().trim();
            switch (choice) {
                // ── Design Pattern Use Cases ──────────────────────────────
                case "1" -> handleTrackReportStatus();
                case "2" -> handleSubmitComplaint();
                case "3" -> handleViewPendingReports();
                case "4" -> handleTrackCollectionProgress();
                // ── CRUD ──────────────────────────────────────────────────
                case "5" -> reportService.showMenu();
                case "6" -> complaintService.showMenu();
                case "7" -> taskService.showMenu();
                // ── Exit ──────────────────────────────────────────────────
                case "0" -> {
                    System.out.println("\n  Cam on ban da su dung he thong. Tam biet!\n");
                    running = false;
                }
                default -> System.out.println("\n  [!] Lua chon khong hop le, vui long thu lai.\n");
            }
        }
    }

    private void printMainMenu() {
        System.out.println();
        System.out.println("  +=======================================================================+");
        System.out.println("  |          WASTE COLLECTION & RECYCLING CONSOLE APP                    |");
        System.out.println("  +=======================================================================+");
        System.out.println("  |                                                                       |");
        System.out.println("  |  -- USE CASE (Design Patterns) --                                    |");
        System.out.println("  |  1. [Citizen]     UC-04: Theo doi trang thai bao cao  [AbsFact]      |");
        System.out.println("  |  2. [Citizen]     UC-07: Gui khieu nai / phan hoi     [Decorator]    |");
        System.out.println("  |  3. [Enterprise]  UC-09: Xem bao cao cho xu ly        [AbsFact]      |");
        System.out.println("  |  4. [Enterprise]  UC-13: Theo doi tien do thu gom     [Decorator]    |");
        System.out.println("  |                                                                       |");
        System.out.println("  |  -- CRUD Management --                                               |");
        System.out.println("  |  5. [Citizen]     CRUD Bao cao (Report)                              |");
        System.out.println("  |  6. [Citizen]     CRUD Khieu nai (Complaint)                         |");
        System.out.println("  |  7. [Enterprise]  CRUD Nhiem vu thu gom (Task)                       |");
        System.out.println("  |                                                                       |");
        System.out.println("  |  0. Thoat                                                             |");
        System.out.println("  |                                                                       |");
        System.out.println("  +=======================================================================+");
        System.out.print("  >> Chon chuc nang (0-7): ");
    }

    // ─── ABSTRACT FACTORY USE CASES ────────────────────────────────────────────

    /**
     * UC-04: Track Report Status (Citizen) - Abstract Factory Pattern.
     */
    private void handleTrackReportStatus() {
        System.out.println("\n  [Abstract Factory] Su dung CitizenViewFactory...");
        ViewFactory factory = new CitizenViewFactory();
        ReportView view = factory.createReportView();
        System.out.println("  Factory tao view: " + view.getViewName());
        view.display(sampleData.getCitizenReports());
        waitForEnter();
    }

    /**
     * UC-09: View Pending Reports (Enterprise) - Abstract Factory Pattern.
     */
    private void handleViewPendingReports() {
        System.out.println("\n  [Abstract Factory] Su dung EnterpriseViewFactory...");
        ViewFactory factory = new EnterpriseViewFactory();
        ReportView view = factory.createReportView();
        System.out.println("  Factory tao view: " + view.getViewName());
        view.display(sampleData.getAllReports());
        waitForEnter();
    }

    // ─── DECORATOR USE CASES ───────────────────────────────────────────────────

    /**
     * UC-07: Submit Complaint (Citizen) - Decorator Pattern.
     * Chain: Logging -> Timestamp -> Validation -> SubmitComplaintAction
     */
    private void handleSubmitComplaint() {
        System.out.println("\n  [Decorator Pattern] Xay dung chuoi decorator...");
        BaseAction action = new SubmitComplaintAction(sampleData, scanner);
        action = new ValidationDecorator(action);
        action = new TimestampDecorator(action);
        action = new LoggingDecorator(action);
        System.out.println("  Action chain: " + action.getDescription());
        String result = action.execute();
        System.out.println(result);
        waitForEnter();
    }

    /**
     * UC-13: Track Collection Progress (Enterprise) - Decorator Pattern.
     * Chain: Logging -> Timestamp -> TrackProgressAction
     */
    private void handleTrackCollectionProgress() {
        System.out.println("\n  [Decorator Pattern] Xay dung chuoi decorator...");
        BaseAction action = new TrackProgressAction(sampleData);
        action = new TimestampDecorator(action);
        action = new LoggingDecorator(action);
        System.out.println("  Action chain: " + action.getDescription());
        String result = action.execute();
        System.out.println(result);
        waitForEnter();
    }

    private void waitForEnter() {
        System.out.print("\n  Nhan Enter de quay lai menu chinh...");
        scanner.nextLine();
    }
}
