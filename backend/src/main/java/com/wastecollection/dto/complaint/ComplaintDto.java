package com.wastecollection.dto.complaint;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ComplaintDto {
    private UUID complaintId;
    private UUID createdByUserId;
    private String createdByName;
    private UUID reportId;
    private UUID visitId;
    private String title;
    private String content;
    private String category;
    private String priority;
    private String status;
    private String adminResponse;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
