package com.example.backendservice.features.waste.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedReportDTO {

    private UUID reportId;
    private String citizenName;
    private String areaName;
    private String wasteTypeName;
    private Double estimatedWeightKg;
    private String locationText;
    private String priority;
    private String status;
    private Double priorityScore;
    private String priorityReason;
    private String createdAt;
}
