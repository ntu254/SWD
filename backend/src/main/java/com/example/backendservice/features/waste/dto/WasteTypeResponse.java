package com.example.backendservice.features.waste.dto;

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
public class WasteTypeResponse {
    private UUID typeId;
    private String code;
    private String name;
    private String description;
    private Double pointsPerKg;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
