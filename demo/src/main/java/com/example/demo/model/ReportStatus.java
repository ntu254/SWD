package com.example.demo.model;

public enum ReportStatus {
    PENDING("Chờ xử lý"),
    ACCEPTED("Đã tiếp nhận"),
    ASSIGNED("Đã phân công"),
    IN_PROGRESS("Đang thu gom"),
    COLLECTED("Đã thu gom"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy");

    private final String displayName;

    ReportStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
