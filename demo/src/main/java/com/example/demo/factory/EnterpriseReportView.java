package com.example.demo.factory;

import com.example.demo.model.Report;
import com.example.demo.model.ReportStatus;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Concrete Product - UC-09: View Pending Reports (Enterprise).
 * Hiển thị danh sách báo cáo pending cần xử lý, nhóm theo khu vực.
 */
public class EnterpriseReportView implements ReportView {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    public void display(List<Report> reports) {
        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════════╗");
        System.out.println("║        UC-09: XEM BÁO CÁO CHỜ XỬ LÝ (ENTERPRISE)                   ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════╝");
        System.out.println();

        // Lọc chỉ pending reports
        List<Report> pendingReports = reports.stream()
                .filter(r -> r.getStatus() == ReportStatus.PENDING || r.getStatus() == ReportStatus.ACCEPTED)
                .toList();

        if (pendingReports.isEmpty()) {
            System.out.println("  ✅ Không có báo cáo nào đang chờ xử lý.");
            return;
        }

        System.out.println("  📊 Tổng số báo cáo chờ xử lý: " + pendingReports.size());
        System.out.println();

        // Nhóm theo khu vực
        Map<String, List<Report>> groupedByArea = pendingReports.stream()
                .collect(Collectors.groupingBy(Report::getLocation));

        for (Map.Entry<String, List<Report>> entry : groupedByArea.entrySet()) {
            System.out.println("  📍 Khu vực: " + entry.getKey() + " (" + entry.getValue().size() + " báo cáo)");
            System.out.println("  ┌──────────┬────────────────────────────────┬──────────────┬──────────────────┐");
            System.out.println("  │ ID       │ Mô tả                          │ Loại rác     │ Ngày tạo         │");
            System.out.println("  ├──────────┼────────────────────────────────┼──────────────┼──────────────────┤");

            for (Report report : entry.getValue()) {
                System.out.printf("  │ %-8s │ %-30s │ %-12s │ %-16s │%n",
                        report.getId(),
                        truncate(report.getDescription(), 30),
                        truncate(report.getWasteType(), 12),
                        report.getCreatedAt().format(FORMATTER));
            }

            System.out.println("  └──────────┴────────────────────────────────┴──────────────┴──────────────────┘");
            System.out.println();
        }

        // Thống kê theo loại rác
        System.out.println("  📈 Thống kê theo loại rác:");
        Map<String, Long> wasteTypeCount = pendingReports.stream()
                .collect(Collectors.groupingBy(Report::getWasteType, Collectors.counting()));
        wasteTypeCount.forEach((type, count) ->
                System.out.println("     • " + type + ": " + count + " báo cáo"));
    }

    @Override
    public String getViewName() {
        return "Enterprise Pending Reports View";
    }

    private String truncate(String text, int maxLength) {
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }
}
