package com.example.backendservice.features.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectorProfileResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;

    // Collector specific
    private UUID assignedAreaId;
    private String assignedAreaName;
    private String vehicleType; // MOTORCYCLE, TRUCK, VAN, BICYCLE
    private String vehiclePlate;
    private Boolean isAvailable;
    private Double currentLat;
    private Double currentLng;
    private Double averageRating;
    private Integer totalVisits;
    private String status; // ACTIVE, INACTIVE, SUSPENDED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
