package com.example.backendservice.features.collector.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for updating task status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskStatusRequest {

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "COLLECTED|FAILED|CANCELLED", message = "Status must be COLLECTED, FAILED, or CANCELLED")
    private String status;

    private String note;
}
