package com.example.backendservice.features.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateComplaintRequest {

    @NotNull(message = "Citizen ID is required")
    private UUID citizenId;

    private UUID collectorId; // Optional: Collector being complained about
    private UUID taskAssignmentId; // Optional: Related task assignment

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must be less than 2000 characters")
    private String description;

    private String category; // LATE_ARRIVAL, RUDE_BEHAVIOR, INCOMPLETE_COLLECTION, DAMAGE, POINTS_ERROR,
                             // BUG, SERVICE_ISSUE, OTHER
    private String evidenceImages; // JSON array of image URLs
    private String priority; // LOW, NORMAL, HIGH, URGENT
}
