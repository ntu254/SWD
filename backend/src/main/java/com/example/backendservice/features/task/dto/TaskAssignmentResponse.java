package com.example.backendservice.features.task.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskAssignmentResponse {

    private UUID id;
    private UUID taskId;
    private UUID collectorId;
    private String collectorName;
    private String status;
    private String rejectionReason;
    private String evidenceImages;
    private Double collectedWeightKg;
    private String notes;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
