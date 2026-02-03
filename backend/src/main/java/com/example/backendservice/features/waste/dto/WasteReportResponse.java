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
public class WasteReportResponse {
    private UUID reportId;
    private UUID citizenUserId;
    private String citizenName;
    private UUID areaId;
    private String areaName;

    private String addressText;
    private Double latitude;
    private Double longitude;
    private String noteText;
    private String photoUrl;

    private String status; // PENDING, APPROVED, REJECTED, ASSIGNED, COMPLETED
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
