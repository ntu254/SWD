package com.example.demo.model;

import java.time.LocalDateTime;

public class Complaint {
    private String id;
    private String reportId;
    private String title;
    private String content;
    private ComplaintCategory category;
    private String priority;
    private LocalDateTime createdAt;

    public Complaint(String id, String reportId, String title, String content,
                     ComplaintCategory category, String priority, LocalDateTime createdAt) {
        this.id = id;
        this.reportId = reportId;
        this.title = title;
        this.content = content;
        this.category = category;
        this.priority = priority;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public ComplaintCategory getCategory() { return category; }
    public void setCategory(ComplaintCategory category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
