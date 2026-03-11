package com.example.demo.service;

import com.example.demo.data.SampleData;
import com.example.demo.model.Complaint;
import com.example.demo.model.ComplaintCategory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Scanner;

/**
 * Service xử lý CRUD cho Complaint (Citizen).
 */
public class ComplaintService {

    private final SampleData sampleData;
    private final Scanner scanner;
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public ComplaintService(SampleData sampleData, Scanner scanner) {
        this.sampleData = sampleData;
        this.scanner = scanner;
    }

    public void showMenu() {
        boolean running = true;
        while (running) {
            System.out.println();
            System.out.println("  +------------------------------------------+");
            System.out.println("  |     CRUD QUAN LY KHIEU NAI (COMPLAINT)     |");
            System.out.println("  +------------------------------------------+");
            System.out.println("  | 1. [CREATE] Gui khieu nai moi             |");
            System.out.println("  | 2. [READ]   Xem danh sach khieu nai       |");
            System.out.println("  | 3. [READ]   Tim khieu nai theo ID         |");
            System.out.println("  | 4. [UPDATE] Chinh sua khieu nai           |");
            System.out.println("  | 5. [DELETE] Xoa khieu nai                 |");
            System.out.println("  | 0. Quay lai menu chinh                    |");
            System.out.println("  +------------------------------------------+");
            System.out.print("  >> Chon: ");

            String choice = scanner.nextLine().trim();
            switch (choice) {
                case "1" -> createComplaint();
                case "2" -> readAllComplaints();
                case "3" -> readComplaintById();
                case "4" -> updateComplaint();
                case "5" -> deleteComplaint();
                case "0" -> running = false;
                default -> System.out.println("  [!] Lua chon khong hop le.");
            }
        }
    }

    private void createComplaint() {
        System.out.println("\n  === [CREATE] GUI KHIEU NAI MOI ===");
        System.out.print("  Report ID lien quan (vd: RPT-002): ");
        String reportId = scanner.nextLine().trim();
        System.out.print("  Tieu de: ");
        String title = scanner.nextLine().trim();
        System.out.print("  Noi dung: ");
        String content = scanner.nextLine().trim();

        System.out.println("  Loai: 1.COLLECTION_ISSUE  2.SERVICE_ISSUE  3.POINTS_ERROR  4.OTHER");
        System.out.print("  Chon (1-4): ");
        ComplaintCategory[] cats = ComplaintCategory.values();
        int catIdx = 3;
        try {
            catIdx = Integer.parseInt(scanner.nextLine().trim()) - 1;
            if (catIdx < 0 || catIdx >= cats.length) catIdx = 3;
        } catch (NumberFormatException ignored) {}

        String id = sampleData.nextComplaintId();
        Complaint c = new Complaint(id, reportId, title, content, cats[catIdx], "Normal", LocalDateTime.now());
        sampleData.addComplaint(c);
        System.out.println("  [OK] Gui thanh cong! ID: " + id + " | Trang thai: Pending");
    }

    private void readAllComplaints() {
        System.out.println("\n  === [READ] DANH SACH KHIEU NAI ===");
        List<Complaint> list = sampleData.getComplaints();
        if (list.isEmpty()) {
            System.out.println("  Chua co khieu nai nao.");
            return;
        }
        System.out.printf("  %-10s %-12s %-28s %-18s %-20s%n", "ID", "Report", "Tieu de", "Loai", "Ngay gui");
        System.out.println("  " + "-".repeat(90));
        for (Complaint c : list) {
            System.out.printf("  %-10s %-12s %-28s %-18s %-20s%n",
                    c.getId(), c.getReportId(),
                    truncate(c.getTitle(), 26),
                    c.getCategory().name(),
                    c.getCreatedAt().format(FMT));
        }
        System.out.println("  Tong: " + list.size() + " khieu nai.");
    }

    private void readComplaintById() {
        System.out.println("\n  === [READ] TIM KHIEU NAI THEO ID ===");
        System.out.print("  Nhap Complaint ID (vd: CMP-001): ");
        String id = scanner.nextLine().trim();
        Optional<Complaint> opt = sampleData.findComplaintById(id);
        if (opt.isPresent()) {
            Complaint c = opt.get();
            System.out.println("  +------------------------------------+");
            System.out.println("  | ID        : " + c.getId());
            System.out.println("  | Report    : " + c.getReportId());
            System.out.println("  | Tieu de   : " + c.getTitle());
            System.out.println("  | Noi dung  : " + c.getContent());
            System.out.println("  | Loai      : " + c.getCategory().name());
            System.out.println("  | Priority  : " + c.getPriority());
            System.out.println("  | Ngay gui  : " + c.getCreatedAt().format(FMT));
            System.out.println("  +------------------------------------+");
        } else {
            System.out.println("  [!] Khong tim thay khieu nai ID: " + id);
        }
    }

    private void updateComplaint() {
        System.out.println("\n  === [UPDATE] CHINH SUA KHIEU NAI ===");
        System.out.print("  Nhap Complaint ID can chinh sua: ");
        String id = scanner.nextLine().trim();
        if (sampleData.findComplaintById(id).isEmpty()) {
            System.out.println("  [!] Khong tim thay khieu nai ID: " + id);
            return;
        }
        System.out.print("  Tieu de moi (Enter de bo qua): ");
        String title = scanner.nextLine().trim();
        System.out.print("  Noi dung moi (Enter de bo qua): ");
        String content = scanner.nextLine().trim();

        boolean updated = sampleData.updateComplaint(id, title, content);
        System.out.println(updated ? "  [OK] Cap nhat thanh cong!" : "  [!] Cap nhat that bai.");
    }

    private void deleteComplaint() {
        System.out.println("\n  === [DELETE] XOA KHIEU NAI ===");
        System.out.print("  Nhap Complaint ID can xoa: ");
        String id = scanner.nextLine().trim();
        System.out.print("  Xac nhan xoa '" + id + "'? (y/n): ");
        String confirm = scanner.nextLine().trim();
        if (confirm.equalsIgnoreCase("y")) {
            boolean deleted = sampleData.deleteComplaint(id);
            System.out.println(deleted ? "  [OK] Da xoa khieu nai " + id : "  [!] Khong tim thay ID: " + id);
        } else {
            System.out.println("  Huy xoa.");
        }
    }

    private String truncate(String text, int max) {
        return text.length() <= max ? text : text.substring(0, max - 2) + "..";
    }
}
