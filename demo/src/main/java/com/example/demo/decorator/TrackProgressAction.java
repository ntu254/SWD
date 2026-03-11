package com.example.demo.decorator;

import com.example.demo.data.SampleData;
import com.example.demo.model.CollectionTask;

import java.util.List;

/**
 * Concrete Component - UC-13: Track Collection Progress (Enterprise).
 * Enterprise theo dõi tiến độ thu gom real-time.
 */
public class TrackProgressAction implements BaseAction {

    private final SampleData sampleData;

    public TrackProgressAction(SampleData sampleData) {
        this.sampleData = sampleData;
    }

    @Override
    public String execute() {
        System.out.println();
        System.out.println("╔══════════════════════════════════════════════════════════════════════╗");
        System.out.println("║       UC-13: THEO DÕI TIẾN ĐỘ THU GOM (ENTERPRISE)                  ║");
        System.out.println("╚══════════════════════════════════════════════════════════════════════╝");
        System.out.println();

        List<CollectionTask> tasks = sampleData.getCollectionTasks();
        StringBuilder result = new StringBuilder();

        result.append("  📊 Tổng số nhiệm vụ thu gom: ").append(tasks.size()).append("\n\n");

        for (CollectionTask task : tasks) {
            result.append("  🚛 Task: ").append(task.getId()).append("\n");
            result.append("  ├─ Report      : ").append(task.getReportId()).append("\n");
            result.append("  ├─ Collector   : ").append(task.getCollectorName()).append("\n");
            result.append("  ├─ Khu vực     : ").append(task.getArea()).append("\n");
            result.append("  ├─ Ngày dự kiến: ").append(task.getScheduledDate()).append("\n");
            result.append("  ├─ Trạng thái  : ").append(getStatusIcon(task.getStatus())).append(" ").append(task.getStatus()).append("\n");
            result.append("  └─ Tiến độ     : ").append(buildProgressBar(task.getProgressPercent())).append("\n");
            result.append("\n");
        }

        // Thống kê tổng hợp
        long completed = tasks.stream().filter(t -> t.getStatus().equals("COMPLETED")).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus().equals("IN_PROGRESS")).count();
        long pending = tasks.stream().filter(t -> t.getStatus().equals("PENDING")).count();
        long assigned = tasks.stream().filter(t -> t.getStatus().equals("ASSIGNED")).count();

        result.append("  ──────────────────────────────────────────────────────────\n");
        result.append("  📈 THỐNG KÊ TỔNG HỢP:\n");
        result.append("     ✅ Hoàn thành  : ").append(completed).append("\n");
        result.append("     🔄 Đang xử lý  : ").append(inProgress).append("\n");
        result.append("     📋 Đã phân công : ").append(assigned).append("\n");
        result.append("     ⏳ Chờ xử lý   : ").append(pending).append("\n");

        int avgProgress = (int) tasks.stream().mapToInt(CollectionTask::getProgressPercent).average().orElse(0);
        result.append("     📊 Tiến độ TB   : ").append(avgProgress).append("%\n");

        return result.toString();
    }

    @Override
    public String getDescription() {
        return "Track Collection Progress Action (UC-13)";
    }

    private String buildProgressBar(int percent) {
        int filled = percent / 5;
        int empty = 20 - filled;
        return "[" + "█".repeat(filled) + "░".repeat(empty) + "] " + percent + "%";
    }

    private String getStatusIcon(String status) {
        return switch (status) {
            case "COMPLETED" -> "✅";
            case "IN_PROGRESS" -> "🔄";
            case "ASSIGNED" -> "📋";
            case "PENDING" -> "⏳";
            default -> "❓";
        };
    }
}
