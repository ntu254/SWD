package com.example.backendservice.features.waste.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWasteReportRequest {

    @NotNull(message = "Area ID is required")
    private UUID areaId;

    private String addressText;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private String noteText;
    private String photoUrl;
}
