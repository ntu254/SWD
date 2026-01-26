package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private String citizenEmail;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;
    private String adminResponse;
    private UUID resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UUID getId() {
        return id;
    }

    public UUID getCitizenId() {
        return citizenId;
    }

    public String getCitizenName() {
        return citizenName;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getStatus() {
        return status;
    }

    public String getPriority() {
        return priority;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public UUID getResolvedById() {
        return resolvedById;
    }

    public String getResolvedByName() {
        return resolvedByName;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
