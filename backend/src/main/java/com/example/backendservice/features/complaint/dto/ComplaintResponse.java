package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private UUID id;
    private UUID citizenId;
    private String citizenName;
    private String citizenEmail;

    private UUID collectorId;
    private String collectorName;
    private UUID taskAssignmentId;

    private String title;
    private String description;
    private String category;
    private String evidenceImages;
    private String status;
    private String priority;
    private String adminResponse;
    private UUID resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
