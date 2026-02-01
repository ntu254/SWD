package com.example.backendservice.features.task.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    private UUID wasteReportId;

    @NotNull(message = "Enterprise ID is required")
    private UUID enterpriseId;

    private UUID areaId;
    private UUID wasteTypeId;

    @Positive(message = "Weight must be positive")
    private Double estimatedWeightKg;

    private String locationText;
    private Double lat;
    private Double lng;
    private String notes;
    private String priority; // LOW, NORMAL, HIGH, URGENT
    private LocalDateTime scheduledAt;
}
