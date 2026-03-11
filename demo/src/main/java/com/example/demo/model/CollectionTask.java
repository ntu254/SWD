package com.example.demo.model;

import java.time.LocalDate;

public class CollectionTask {
    private String id;
    private String reportId;
    private String collectorName;
    private String status;
    private LocalDate scheduledDate;
    private int progressPercent;
    private String area;

    public CollectionTask(String id, String reportId, String collectorName, String status,
                          LocalDate scheduledDate, int progressPercent, String area) {
        this.id = id;
        this.reportId = reportId;
        this.collectorName = collectorName;
        this.status = status;
        this.scheduledDate = scheduledDate;
        this.progressPercent = progressPercent;
        this.area = area;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReportId() { return reportId; }
    public void setReportId(String reportId) { this.reportId = reportId; }
    public String getCollectorName() { return collectorName; }
    public void setCollectorName(String collectorName) { this.collectorName = collectorName; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getScheduledDate() { return scheduledDate; }
    public void setScheduledDate(LocalDate scheduledDate) { this.scheduledDate = scheduledDate; }
    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
}
