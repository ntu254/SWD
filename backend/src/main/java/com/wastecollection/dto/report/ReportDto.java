package com.wastecollection.dto.report;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ReportDto {
    private UUID reportId;
    private UUID reporterUserId;
    private String reporterName;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private UUID areaId;
    private String areaName;
    private Double latitude;
    private Double longitude;
    private Double gpsAccuracyMeters;
    private String description;
    private String reportPhotoUrl;
    private String status;
    private LocalDateTime requestedPickupTime;
    private LocalDateTime createdAt;
}
