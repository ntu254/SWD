package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateComplaintStatusRequest {

    private String status; // Pending, In_Progress, Resolved, Rejected

    private String adminResponse;

    private UUID resolvedById;
}
