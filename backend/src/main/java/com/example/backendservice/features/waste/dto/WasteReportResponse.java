package com.example.backendservice.features.waste.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteReportResponse {

    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private UUID areaId;
    private String areaName;
    private UUID primaryWasteTypeId;
    private String primaryWasteTypeName;
    private Double estimatedWeightKg;
    private String locationText;
    private Double lat;
    private Double lng;
    private String description;
    private String imageUrls;
    private String status;
    private String rejectionReason;
    private String priority;
    private LocalDateTime preferredDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
