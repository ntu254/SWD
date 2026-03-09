package demo.uc12.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UC-12 Entity: Task
 * Task entity - managed by Enterprise.
 */
public class Task {

    private UUID taskId;
    private String enterpriseName;
    private String areaName;
    private String description;
    private LocalDate scheduledDate;
    private String priority;
    private TaskStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Task(String enterpriseName, String areaName, String description,
            LocalDate scheduledDate, String priority) {
        this.taskId = UUID.randomUUID();
        this.enterpriseName = enterpriseName;
        this.areaName = areaName;
        this.description = description;
        this.scheduledDate = scheduledDate;
        this.priority = priority;
        this.status = TaskStatus.PENDING;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public void setRejectionReason(String reason) {
        this.rejectionReason = reason;
    }

    // Getters
    public UUID getTaskId() {
        return taskId;
    }

    public String getEnterpriseName() {
        return enterpriseName;
    }

    public String getAreaName() {
        return areaName;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public String getPriority() {
        return priority;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
