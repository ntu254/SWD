package com.example.backendservice.features.complaint.dto;

import com.example.backendservice.features.complaint.entity.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateComplaintStatusRequest {

    @NotNull(message = "Status is required")
    private ComplaintStatus status;

    private String adminResponse;
}
