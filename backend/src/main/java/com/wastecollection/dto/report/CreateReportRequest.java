package com.wastecollection.dto.report;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateReportRequest {

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Double gpsAccuracyMeters;

    private String description;

    private UUID wasteTypeId;

    private UUID areaId;

    private LocalDateTime requestedPickupTime;

    /** Image URL after uploading to Cloudinary */
    private String reportPhotoUrl;
}
