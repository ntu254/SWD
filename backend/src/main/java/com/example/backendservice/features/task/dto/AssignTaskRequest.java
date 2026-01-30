package com.example.backendservice.features.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignTaskRequest {

    @NotNull(message = "Task ID is required")
    private UUID taskId;

    @NotNull(message = "Collector ID is required")
    private UUID collectorId;

    private String notes;
}
