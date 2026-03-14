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

    @NotNull(message = "Waste type is required")
    private UUID wasteTypeId;

    @NotNull(message = "Area is required")
    private UUID areaId;

    private LocalDateTime requestedPickupTime;

    /** Image URL after uploading to Cloudinary */
    private String reportPhotoUrl;
}
