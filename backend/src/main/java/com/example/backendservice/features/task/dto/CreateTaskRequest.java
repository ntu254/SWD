package com.example.backendservice.features.task.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTaskRequest {

    @NotNull(message = "Report ID is required")
    private UUID reportId;

    @NotNull(message = "Area ID is required")
    private UUID areaId;

    @NotNull(message = "Scheduled date is required")
    private LocalDate scheduledDate;
}
