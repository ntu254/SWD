package com.example.demo.factory;

import com.example.demo.model.Report;
import com.example.demo.model.ReportStatus;

import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Concrete Product - UC-04: Track Report Status (Citizen).
 * Hiển thị danh sách report của Citizen với status tracking chi tiết.
 */
public class CitizenReportView implements ReportView {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public void display(List<Report> reports) {
        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════════╗");
        System.out.println("║           UC-04: THEO DÕI TRẠNG THÁI BÁO CÁO (CITIZEN)             ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════╝");
        System.out.println();

        if (reports.isEmpty()) {
            System.out.println("  Bạn chưa có báo cáo nào.");
            return;
        }

        System.out.println("  Tổng số báo cáo: " + reports.size());
        System.out.println("  ──────────────────────────────────────────────────────────────────");

        for (Report report : reports) {
            System.out.println();
            System.out.println("  📋 Báo cáo: " + report.getId());
            System.out.println("  ├─ Mô tả     : " + report.getDescription());
            System.out.println("  ├─ Loại rác   : " + report.getWasteType());
            System.out.println("  ├─ Địa điểm   : " + report.getLocation());
            System.out.println("  ├─ Ngày tạo   : " + report.getCreatedAt().format(FORMATTER));
            System.out.println("  ├─ Trạng thái : " + report.getStatus().getDisplayName());
            System.out.println("  └─ Tiến trình : " + buildProgressBar(report.getStatus()));
            System.out.println();
            System.out.println("     " + buildStatusTimeline(report.getStatus()));
            System.out.println("  ──────────────────────────────────────────────────────────────────");
        }
    }

    @Override
    public String getViewName() {
        return "Citizen Report Status Tracking View";
    }

    private String buildProgressBar(ReportStatus status) {
        int progress = getProgressPercent(status);
        int filled = progress / 5;
        int empty = 20 - filled;
        return "[" + "█".repeat(filled) + "░".repeat(empty) + "] " + progress + "%";
    }

    private int getProgressPercent(ReportStatus status) {
        return switch (status) {
            case PENDING -> 10;
            case ACCEPTED -> 25;
            case ASSIGNED -> 40;
            case IN_PROGRESS -> 60;
            case COLLECTED -> 80;
            case COMPLETED -> 100;
            case CANCELLED -> 0;
        };
    }

    private String buildStatusTimeline(ReportStatus status) {
        String[] stages = {"PENDING", "ACCEPTED", "ASSIGNED", "IN_PROGRESS", "COLLECTED", "COMPLETED"};
        int currentIndex = getStageIndex(status);

        StringBuilder timeline = new StringBuilder();
        for (int i = 0; i < stages.length; i++) {
            if (i == currentIndex) {
                timeline.append(" ➤ [").append(stages[i]).append("]");
            } else if (i < currentIndex) {
                timeline.append(" ✓ ").append(stages[i]);
            } else {
                timeline.append(" ○ ").append(stages[i]);
            }
            if (i < stages.length - 1) {
                timeline.append(" → ");
            }
        }
        return timeline.toString();
    }

    private int getStageIndex(ReportStatus status) {
        return switch (status) {
            case PENDING -> 0;
            case ACCEPTED -> 1;
            case ASSIGNED -> 2;
            case IN_PROGRESS -> 3;
            case COLLECTED -> 4;
            case COMPLETED -> 5;
            case CANCELLED -> -1;
        };
    }
}
