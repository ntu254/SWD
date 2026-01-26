package com.example.backendservice.features.notification.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificationResponse {

    private UUID id;
    private String title;
    private String content;
    private String type;
    private String targetAudience;
    private String priority;
    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private UUID createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public NotificationResponse() {
    }

    public NotificationResponse(UUID id, String title, String content, String type, String targetAudience,
            String priority, Boolean isActive, LocalDateTime startDate, LocalDateTime endDate, UUID createdById,
            String createdByName, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.type = type;
        this.targetAudience = targetAudience;
        this.priority = priority;
        this.isActive = isActive;
        this.startDate = startDate;
        this.endDate = endDate;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static NotificationResponseBuilder builder() {
        return new NotificationResponseBuilder();
    }

    public static class NotificationResponseBuilder {
        private UUID id;
        private String title;
        private String content;
        private String type;
        private String targetAudience;
        private String priority;
        private Boolean isActive;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private UUID createdById;
        private String createdByName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        NotificationResponseBuilder() {
        }

        public NotificationResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public NotificationResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public NotificationResponseBuilder content(String content) {
            this.content = content;
            return this;
        }

        public NotificationResponseBuilder type(String type) {
            this.type = type;
            return this;
        }

        public NotificationResponseBuilder targetAudience(String targetAudience) {
            this.targetAudience = targetAudience;
            return this;
        }

        public NotificationResponseBuilder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public NotificationResponseBuilder isActive(Boolean isActive) {
            this.isActive = isActive;
            return this;
        }

        public NotificationResponseBuilder startDate(LocalDateTime startDate) {
            this.startDate = startDate;
            return this;
        }

        public NotificationResponseBuilder endDate(LocalDateTime endDate) {
            this.endDate = endDate;
            return this;
        }

        public NotificationResponseBuilder createdById(UUID createdById) {
            this.createdById = createdById;
            return this;
        }

        public NotificationResponseBuilder createdByName(String createdByName) {
            this.createdByName = createdByName;
            return this;
        }

        public NotificationResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public NotificationResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public NotificationResponse build() {
            return new NotificationResponse(id, title, content, type, targetAudience, priority, isActive, startDate,
                    endDate, createdById, createdByName, createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }

    public UUID getCreatedById() {
        return createdById;
    }

    public void setCreatedById(UUID createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
