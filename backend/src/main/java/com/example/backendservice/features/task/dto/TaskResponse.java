package com.example.backendservice.features.task.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {

    private UUID id;
    private UUID wasteReportId;
    private UUID enterpriseId;
    private String enterpriseName;
    private UUID areaId;
    private String areaName;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private Double estimatedWeightKg;
    private Double actualWeightKg;
    private String locationText;
    private Double lat;
    private Double lng;
    private String notes;
    private String status;
    private String priority;
    private LocalDateTime scheduledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private Integer pointsAwarded;
    private LocalDateTime createdAt;
}
