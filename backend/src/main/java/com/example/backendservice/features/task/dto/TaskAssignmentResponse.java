package com.example.backendservice.features.task.dto;

import com.example.backendservice.features.task.entity.TaskAssignmentStatus;
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
public class TaskAssignmentResponse {
    private UUID assignmentId;
    private UUID taskId;
    private UUID collectorUserId;
    private String collectorName;
    private TaskAssignmentStatus status;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
}
