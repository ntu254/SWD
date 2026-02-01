package com.example.backendservice.features.waste.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WasteTypeResponse {

    private UUID id;
    private String name;
    private String nameVi;
    private String description;
    private String iconUrl;
    private String colorCode;
    private Double basePointsPerKg;
    private String status;
    private LocalDateTime createdAt;
}
