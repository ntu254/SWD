package com.wastecollection.dto.task;

import com.wastecollection.dto.report.ReportDto;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TaskDto {
    private UUID taskId;
    private UUID reportId;
    private UUID enterpriseUserId;
    private String enterpriseName;
    private UUID createdByUserId;
    private UUID collectorUserId;
    private String collectorName;
    private String assignmentStatus;
    private UUID areaId;
    private String areaName;
    private String status;
    private String priority;
    private LocalDate scheduledDate;
    private String rejectionReason;
    private ReportDto report;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
