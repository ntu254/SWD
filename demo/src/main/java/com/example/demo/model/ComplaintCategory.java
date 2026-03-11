package com.example.demo.model;

public enum ComplaintCategory {
    COLLECTION_ISSUE("Vấn đề thu gom"),
    SERVICE_ISSUE("Vấn đề dịch vụ"),
    POINTS_ERROR("Lỗi tính điểm"),
    OTHER("Khác");

    private final String displayName;

    ComplaintCategory(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
