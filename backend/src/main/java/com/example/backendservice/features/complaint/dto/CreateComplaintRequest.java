package com.example.backendservice.features.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateComplaintRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Content must be less than 5000 characters")
    private String content;

    private String category; // BUG, FEATURE, POINTS_ERROR, OTHER

    private String priority; // Low, Normal, High, Urgent

    private UUID reportId;

    private UUID visitId;
}
