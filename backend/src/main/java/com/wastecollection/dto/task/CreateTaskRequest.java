package com.wastecollection.dto.task;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateTaskRequest {

    private UUID reportId;

    @NotNull(message = "Enterprise user ID is required")
    private UUID enterpriseUserId;

    private UUID areaId;

    private String priority;

    private LocalDate scheduledDate;
}
