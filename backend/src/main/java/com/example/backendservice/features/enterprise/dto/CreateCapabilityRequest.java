package com.example.backendservice.features.enterprise.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCapabilityRequest {

    @NotNull(message = "Area ID is required")
    private UUID areaId;

    @NotNull(message = "Waste Type ID is required")
    private UUID wasteTypeId;

    @NotNull(message = "Daily capacity is required")
    @Positive(message = "Daily capacity must be positive")
    private Double dailyCapacityKg;

    @Positive(message = "Price per kg must be positive")
    private Double pricePerKg;
}
