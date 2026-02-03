package com.example.backendservice.features.complaint.dto;

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
public class ComplaintResponse {
    private UUID complaintId;
    private UUID createdByUserId;
    private String createdByUserName;
    private UUID reportId;
    private UUID visitId;
    private String content;
    private String status;
    private LocalDateTime createdAt;
    private UUID rewardTransactionId;

    // Resolution info if resolved
    private ComplaintResolutionResponse resolution;
}
