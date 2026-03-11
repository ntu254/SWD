package com.example.demo.decorator;

import com.example.demo.data.SampleData;
import com.example.demo.model.Complaint;
import com.example.demo.model.ComplaintCategory;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Scanner;

/**
 * Concrete Component - UC-07: Submit Complaint (Citizen).
 * Cho phép Citizen gửi khiếu nại hoặc phản hồi.
 */
public class SubmitComplaintAction implements BaseAction {

    private final SampleData sampleData;
    private final Scanner scanner;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public SubmitComplaintAction(SampleData sampleData, Scanner scanner) {
        this.sampleData = sampleData;
        this.scanner = scanner;
    }

    @Override
    public String execute() {
        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════════╗");
        System.out.println("║            UC-07: GỬI KHIẾU NẠI / PHẢN HỒI (CITIZEN)                ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════╝");
        System.out.println();

        // Hiển thị danh sách report để chọn
        System.out.println("  📋 Danh sách Report của bạn:");
        var reports = sampleData.getCitizenReports();
        for (int i = 0; i < reports.size(); i++) {
            System.out.printf("     %d. [%s] %s - %s%n", i + 1,
                    reports.get(i).getId(),
                    reports.get(i).getDescription(),
                    reports.get(i).getStatus().getDisplayName());
        }

        System.out.print("\n  Chọn report để khiếu nại (1-" + reports.size() + "): ");
        int choice;
        try {
            choice = Integer.parseInt(scanner.nextLine().trim());
            if (choice < 1 || choice > reports.size()) {
                return "❌ Lựa chọn không hợp lệ.";
            }
        } catch (NumberFormatException e) {
            return "❌ Vui lòng nhập số.";
        }

        String reportId = reports.get(choice - 1).getId();

        System.out.print("  📝 Tiêu đề khiếu nại: ");
        String title = scanner.nextLine().trim();

        System.out.print("  📝 Nội dung khiếu nại: ");
        String content = scanner.nextLine().trim();

        System.out.println("  📂 Chọn loại khiếu nại:");
        ComplaintCategory[] categories = ComplaintCategory.values();
        for (int i = 0; i < categories.length; i++) {
            System.out.printf("     %d. %s (%s)%n", i + 1, categories[i].name(), categories[i].getDisplayName());
        }
        System.out.print("  Chọn (1-" + categories.length + "): ");
        int catChoice;
        try {
            catChoice = Integer.parseInt(scanner.nextLine().trim());
            if (catChoice < 1 || catChoice > categories.length) catChoice = 4;
        } catch (NumberFormatException e) {
            catChoice = 4;
        }

        ComplaintCategory category = categories[catChoice - 1];
        String complaintId = "CMP-" + String.format("%03d", sampleData.getComplaints().size() + 1);
        LocalDateTime now = LocalDateTime.now();

        Complaint complaint = new Complaint(complaintId, reportId, title, content,
                category, "Normal", now);
        sampleData.addComplaint(complaint);

        StringBuilder result = new StringBuilder();
        result.append("\n  ✅ Khiếu nại đã được gửi thành công!\n");
        result.append("  ┌───────────────────────────────────────────────────┐\n");
        result.append("  │ Mã khiếu nại  : ").append(complaintId).append("\n");
        result.append("  │ Report liên quan: ").append(reportId).append("\n");
        result.append("  │ Tiêu đề       : ").append(title).append("\n");
        result.append("  │ Nội dung      : ").append(content).append("\n");
        result.append("  │ Loại          : ").append(category.getDisplayName()).append("\n");
        result.append("  │ Thời gian     : ").append(now.format(FORMATTER)).append("\n");
        result.append("  │ Trạng thái    : Pending (Chờ xử lý)\n");
        result.append("  └───────────────────────────────────────────────────┘\n");

        return result.toString();
    }

    @Override
    public String getDescription() {
        return "Submit Complaint Action (UC-07)";
    }
}
