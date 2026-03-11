package com.example.demo.service;

import com.example.demo.data.SampleData;
import com.example.demo.model.CollectionTask;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * Service xử lý CRUD cho CollectionTask (Enterprise).
 */
public class TaskService {

    private final SampleData sampleData;
    private final Scanner scanner;

    public TaskService(SampleData sampleData, Scanner scanner) {
        this.sampleData = sampleData;
        this.scanner = scanner;
    }

    public void showMenu() {
        boolean running = true;
        while (running) {
            System.out.println();
            System.out.println("  +------------------------------------------+");
            System.out.println("  |    CRUD QUAN LY NHIEM VU (TASK)            |");
            System.out.println("  +------------------------------------------+");
            System.out.println("  | 1. [CREATE] Tao nhiem vu moi              |");
            System.out.println("  | 2. [READ]   Xem danh sach nhiem vu        |");
            System.out.println("  | 3. [READ]   Tim nhiem vu theo ID          |");
            System.out.println("  | 4. [UPDATE] Cap nhat tien do / trang thai |");
            System.out.println("  | 5. [DELETE] Xoa nhiem vu                  |");
            System.out.println("  | 0. Quay lai menu chinh                    |");
            System.out.println("  +------------------------------------------+");
            System.out.print("  >> Chon: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> createTask();
                case "2" -> readAllTasks();
                case "3" -> readTaskById();
                case "4" -> updateTask();
                case "5" -> deleteTask();
                case "0" -> running = false;
                default -> System.out.println("  [!] Lua chon khong hop le.");
            }
        }
    }

    private void createTask() {
        System.out.println("\n  === [CREATE] TAO NHIEM VU MOI ===");
        System.out.print("  Report ID (vd: RPT-005): ");
        String reportId = scanner.nextLine().trim();
        System.out.print("  Ten Collector: ");
        String collectorName = scanner.nextLine().trim();
        System.out.print("  Khu vuc (vd: Quan 1): ");
        String area = scanner.nextLine().trim();
        System.out.print("  Ngay thu gom (yyyy-MM-dd, Enter = hom nay): ");
        String dateInput = scanner.nextLine().trim();
        LocalDate date;
        try {
            date = dateInput.isBlank() ? LocalDate.now() : LocalDate.parse(dateInput);
        } catch (Exception e) {
            date = LocalDate.now();
        }

        String id = sampleData.nextTaskId();
        CollectionTask task = new CollectionTask(id, reportId, collectorName, "PENDING", date, 0, area);
        sampleData.addTask(task);
        System.out.println("  [OK] Tao thanh cong! ID: " + id + " | Status: PENDING | Progress: 0%");
    }

    private void readAllTasks() {
        System.out.println("\n  === [READ] DANH SACH NHIEM VU ===");
        List<CollectionTask> tasks = sampleData.getCollectionTasks();
        if (tasks.isEmpty()) {
            System.out.println("  Khong co nhiem vu nao.");
            return;
        }
        System.out.printf("  %-10s %-10s %-18s %-14s %-14s %-9s%n",
                "ID", "Report", "Collector", "Khu vuc", "Trang thai", "Tien do");
        System.out.println("  " + "-".repeat(82));
        for (CollectionTask t : tasks) {
            System.out.printf("  %-10s %-10s %-18s %-14s %-14s %-9s%n",
                    t.getId(), t.getReportId(),
                    truncate(t.getCollectorName(), 16),
                    truncate(t.getArea(), 12),
                    t.getStatus(),
                    t.getProgressPercent() + "%");
        }
        System.out.println("  Tong: " + tasks.size() + " nhiem vu.");
    }

    private void readTaskById() {
        System.out.println("\n  === [READ] TIM NHIEM VU THEO ID ===");
        System.out.print("  Nhap Task ID (vd: TASK-001): ");
        String id = scanner.nextLine().trim();
        Optional<CollectionTask> opt = sampleData.findTaskById(id);
        if (opt.isPresent()) {
            CollectionTask t = opt.get();
            System.out.println("  +-------------------------------------+");
            System.out.println("  | ID          : " + t.getId());
            System.out.println("  | Report      : " + t.getReportId());
            System.out.println("  | Collector   : " + t.getCollectorName());
            System.out.println("  | Khu vuc     : " + t.getArea());
            System.out.println("  | Trang thai  : " + t.getStatus());
            System.out.println("  | Tien do     : " + t.getProgressPercent() + "%");
            System.out.println("  | Ngay du kien: " + t.getScheduledDate());
            System.out.println("  +-------------------------------------+");
        } else {
            System.out.println("  [!] Khong tim thay task ID: " + id);
        }
    }

    private void updateTask() {
        System.out.println("\n  === [UPDATE] CAP NHAT NHIEM VU ===");
        System.out.print("  Nhap Task ID can cap nhat: ");
        String id = scanner.nextLine().trim();
        if (sampleData.findTaskById(id).isEmpty()) {
            System.out.println("  [!] Khong tim thay task ID: " + id);
            return;
        }
        System.out.print("  Ten Collector moi (Enter bo qua): ");
        String collectorName = scanner.nextLine().trim();
        System.out.println("  Trang thai (PENDING/ASSIGNED/IN_PROGRESS/COMPLETED, Enter bo qua): ");
        System.out.print("  >> ");
        String status = scanner.nextLine().trim();
        System.out.print("  Tien do % (0-100, -1 de bo qua): ");
        int progress = -1;
        try { progress = Integer.parseInt(scanner.nextLine().trim()); } catch (Exception ignored) {}

        boolean updated = sampleData.updateTask(id, collectorName, status, progress);
        System.out.println(updated ? "  [OK] Cap nhat thanh cong!" : "  [!] Cap nhat that bai.");
    }

    private void deleteTask() {
        System.out.println("\n  === [DELETE] XOA NHIEM VU ===");
        System.out.print("  Nhap Task ID can xoa: ");
        String id = scanner.nextLine().trim();
        System.out.print("  Xac nhan xoa '" + id + "'? (y/n): ");
        String confirm = scanner.nextLine().trim();
        if (confirm.equalsIgnoreCase("y")) {
            boolean deleted = sampleData.deleteTask(id);
            System.out.println(deleted ? "  [OK] Da xoa task " + id : "  [!] Khong tim thay task ID: " + id);
        } else {
            System.out.println("  Huy xoa.");
        }
    }

    private String truncate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 2) + "..";
    }
}
