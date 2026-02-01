package com.example.backendservice.features.reward.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculatePointsRequest {

    private UUID wasteTypeId;
    private Double weightKg;
}
