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
public class CitizenProfileResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;

    // Citizen specific
    private UUID defaultAreaId;
    private String defaultAreaName;
    private String addressText;
    private Double latitude;
    private Double longitude;

    // New fields from schema
    private String sortingLevel; // NONE, BASIC, INTERMEDIATE, ADVANCED
    private Integer totalPoints;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
