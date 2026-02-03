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
public class ComplaintResolutionResponse {
    private UUID resolutionId;
    private UUID complaintId;
    private UUID adminUserId;
    private String adminUserName;
    private String decision;
    private String note;
    private Boolean isAccepted;
    private LocalDateTime resolvedAt;
}
