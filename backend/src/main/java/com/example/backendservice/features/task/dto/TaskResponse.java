package com.example.backendservice.features.task.dto;

import com.example.backendservice.features.task.entity.TaskStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    @JsonProperty("id")
    private UUID id;
    private UUID wasteReportId;
    private UUID enterpriseId;
    private UUID areaId;
    private String areaName;
    private LocalDate scheduledDate;
    private TaskStatus status;
    private String priority;
    private String notes;
    private String rejectionReason;

    // Details from WasteReport
    private String citizenName;
    private String citizenPhone;
    private String address;
    private Double latitude;
    private Double longitude;
    @JsonProperty("wasteType")
    private String wasteType;
    private String description;
    private String photoUrl;
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
