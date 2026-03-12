package com.wastecollection.dto.task;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AssignTaskRequest {

    @NotNull(message = "Collector user ID is required")
    private UUID collectorUserId;
}
