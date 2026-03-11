package com.example.backendservice.features.collector.dto;

import com.example.backendservice.features.task.entity.TaskAssignmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

/**
 * Response DTO after accepting a task
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcceptTaskResponse {

    private UUID taskId;
    private TaskAssignmentStatus status;
    private Instant acceptedAt;
    private Instant onWayAt;
    private String message;
}
