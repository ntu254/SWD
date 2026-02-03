package com.example.backendservice.features.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintRequest {

    private UUID reportId; // Optional

    private UUID visitId; // Optional

    @NotBlank(message = "Content is required")
    private String content;
}
