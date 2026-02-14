package com.example.backendservice.features.complaint.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateComplaintStatusRequest {

    @NotBlank(message = "Status is required")
    private String status; // Pending, In_Progress, Resolved, Rejected

    private String adminResponse;
}
