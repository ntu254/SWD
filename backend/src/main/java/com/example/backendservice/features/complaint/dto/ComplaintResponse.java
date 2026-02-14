package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {
    private UUID complaintId;
    private UUID createdByUserId;
    private String createdByUserName;
    private String title;
    private String content;
    private String category;
    private String priority;
    private String status;
    private String adminResponse;
    private UUID reportId;
    private UUID visitId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private UUID rewardTransactionId;
    private ComplaintResolutionResponse resolution;
}
