package com.example.demo.service;

import com.example.demo.data.SampleData;
import com.example.demo.model.Report;
import com.example.demo.model.ReportStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * Service xử lý CRUD cho Report (Citizen).
 */
public class ReportService {

    private final SampleData sampleData;
    private final Scanner scanner;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public ReportService(SampleData sampleData, Scanner scanner) {
        this.sampleData = sampleData;
        this.scanner = scanner;
    }

    public void showMenu() {
        boolean running = true;
        while (running) {
            System.out.println();
            System.out.println("  +------------------------------------------+");
            System.out.println("  |      CRUD QUAN LY BAO CAO (REPORT)         |");
            System.out.println("  +------------------------------------------+");
            System.out.println("  | 1. [CREATE] Tao bao cao moi               |");
            System.out.println("  | 2. [READ]   Xem danh sach bao cao         |");
            System.out.println("  | 3. [READ]   Tim bao cao theo ID           |");
            System.out.println("  | 4. [UPDATE] Cap nhat bao cao              |");
            System.out.println("  | 5. [DELETE] Xoa bao cao                   |");
            System.out.println("  | 0. Quay lai menu chinh                    |");
            System.out.println("  +------------------------------------------+");
            System.out.print("  >> Chon: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> createReport();
                case "2" -> readAllReports();
                case "3" -> readReportById();
                case "4" -> updateReport();
                case "5" -> deleteReport();
                case "0" -> running = false;
                default -> System.out.println("  [!] Lua chon khong hop le.");
            }
        }
    }

    private void createReport() {
        System.out.println("\n  === [CREATE] TAO BAO CAO MOI ===");
        System.out.print("  Mo ta rac: ");
        String description = scanner.nextLine().trim();
        System.out.print("  Loai rac (RacSinhHoat/RacTaiChe/RacNguyHai/RacHuuCo): ");
        String wasteType = scanner.nextLine().trim();
        System.out.print("  Dia diem: ");
        String location = scanner.nextLine().trim();

        String id = sampleData.nextReportId();
        Report report = new Report(id, description, wasteType, ReportStatus.PENDING,
                LocalDateTime.now(), location, "Nguyen Van A");
        sampleData.addReport(report);

        System.out.println("  [OK] Tao thanh cong! ID: " + id + " | Status: PENDING");
    }

    private void readAllReports() {
        System.out.println("\n  === [READ] DANH SACH BAO CAO ===");
        List<Report> reports = sampleData.getAllReports();
        if (reports.isEmpty()) {
            System.out.println("  Khong co bao cao nao.");
            return;
        }
        System.out.printf("  %-10s %-35s %-15s %-12s %-20s%n", "ID", "Mo ta", "Loai rac", "Trang thai", "Dia diem");
        System.out.println("  " + "-".repeat(95));
        for (Report r : reports) {
            System.out.printf("  %-10s %-35s %-15s %-12s %-20s%n",
                    r.getId(),
                    truncate(r.getDescription(), 33),
                    truncate(r.getWasteType(), 13),
                    r.getStatus().name(),
                    truncate(r.getLocation(), 18));
        }
        System.out.println("  Tong: " + reports.size() + " bao cao.");
    }

    private void readReportById() {
        System.out.println("\n  === [READ] TIM BAO CAO THEO ID ===");
        System.out.print("  Nhap Report ID (vd: RPT-001): ");
        String id = scanner.nextLine().trim();
        Optional<Report> opt = sampleData.findReportById(id);
        if (opt.isPresent()) {
            Report r = opt.get();
            System.out.println("  +------------------------------------+");
            System.out.println("  | ID        : " + r.getId());
            System.out.println("  | Mo ta     : " + r.getDescription());
            System.out.println("  | Loai rac  : " + r.getWasteType());
            System.out.println("  | Trang thai: " + r.getStatus().name());
            System.out.println("  | Dia diem  : " + r.getLocation());
            System.out.println("  | Nguoi bao : " + r.getReporterName());
            System.out.println("  | Ngay tao  : " + r.getCreatedAt().format(FMT));
            System.out.println("  +------------------------------------+");
        } else {
            System.out.println("  [!] Khong tim thay bao cao voi ID: " + id);
        }
    }

    private void updateReport() {
        System.out.println("\n  === [UPDATE] CAP NHAT BAO CAO ===");
        System.out.print("  Nhap Report ID can cap nhat: ");
        String id = scanner.nextLine().trim();

        if (sampleData.findReportById(id).isEmpty()) {
            System.out.println("  [!] Khong tim thay bao cao ID: " + id);
            return;
        }

        System.out.print("  Mo ta moi (Enter de bo qua): ");
        String description = scanner.nextLine().trim();
        System.out.print("  Loai rac moi (Enter de bo qua): ");
        String wasteType = scanner.nextLine().trim();
        System.out.print("  Dia diem moi (Enter de bo qua): ");
        String location = scanner.nextLine().trim();

        boolean updated = sampleData.updateReport(id, description, wasteType, location);
        System.out.println(updated ? "  [OK] Cap nhat thanh cong!" : "  [!] Cap nhat that bai.");
    }

    private void deleteReport() {
        System.out.println("\n  === [DELETE] XOA BAO CAO ===");
        System.out.print("  Nhap Report ID can xoa: ");
        String id = scanner.nextLine().trim();
        System.out.print("  Xac nhan xoa '" + id + "'? (y/n): ");
        String confirm = scanner.nextLine().trim();
        if (confirm.equalsIgnoreCase("y")) {
            boolean deleted = sampleData.deleteReport(id);
            System.out.println(deleted ? "  [OK] Da xoa bao cao " + id : "  [!] Khong tim thay bao cao ID: " + id);
        } else {
            System.out.println("  Huy xoa.");
        }
    }

    private String truncate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 2) + "..";
    }
}
