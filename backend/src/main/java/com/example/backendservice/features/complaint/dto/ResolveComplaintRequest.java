package com.example.backendservice.features.complaint.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveComplaintRequest {

    @NotNull(message = "Complaint ID is required")
    private UUID complaintId;

    private String decision; // COMPENSATE, WARN_COLLECTOR, NO_ACTION, ESCALATE

    private String note;

    private Boolean isAccepted;

    // If compensating, points to award
    private Double compensationPoints;
}
