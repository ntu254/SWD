package com.example.demo.model;

import java.time.LocalDateTime;

public class Report {
    private String id;
    private String description;
    private String wasteType;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private String location;
    private String reporterName;

    public Report(String id, String description, String wasteType, ReportStatus status,
                  LocalDateTime createdAt, String location, String reporterName) {
        this.id = id;
        this.description = description;
        this.wasteType = wasteType;
        this.status = status;
        this.createdAt = createdAt;
        this.location = location;
        this.reporterName = reporterName;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getWasteType() { return wasteType; }
    public void setWasteType(String wasteType) { this.wasteType = wasteType; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }
}
