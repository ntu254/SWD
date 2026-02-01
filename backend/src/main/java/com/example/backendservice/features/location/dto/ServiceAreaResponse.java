package com.example.backendservice.features.location.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceAreaResponse {

    private UUID id;
    private String name;
    private String description;
    private Double centerLat;
    private Double centerLng;
    private Double radiusKm;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
