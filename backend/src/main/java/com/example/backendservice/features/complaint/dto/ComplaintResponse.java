package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplaintResponse {

    private Long id;
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;
    private String title;
    private String description;
    private String category;
    private String status;
    private String priority;
    private String adminResponse;
    private Long resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
