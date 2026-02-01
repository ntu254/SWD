package com.example.backendservice.features.waste.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWasteReportRequest {

    @NotNull(message = "Citizen ID is required")
    private UUID citizenId;

    private UUID areaId;
    private UUID primaryWasteTypeId;

    @Positive(message = "Weight must be positive")
    private Double estimatedWeightKg;

    private String locationText;
    private Double lat;
    private Double lng;
    private String description;
    private String imageUrls; // JSON array
    private String priority; // LOW, NORMAL, HIGH, URGENT
    private LocalDateTime preferredDate;
}
