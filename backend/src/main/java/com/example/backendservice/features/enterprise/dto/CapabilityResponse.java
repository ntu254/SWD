package com.example.backendservice.features.enterprise.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CapabilityResponse {

    private UUID id;
    private UUID enterpriseId;
    private String enterpriseName;
    private UUID areaId;
    private String areaName;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private Double dailyCapacityKg;
    private Double usedCapacityKg;
    private Double availableCapacityKg;
    private Double pricePerKg;
    private String status;
    private LocalDateTime createdAt;
}
