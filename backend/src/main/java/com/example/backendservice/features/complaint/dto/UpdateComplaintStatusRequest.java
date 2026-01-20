package com.example.backendservice.features.complaint.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateComplaintStatusRequest {

    private String status; // Pending, In_Progress, Resolved, Rejected

    private String adminResponse;

    private Long resolvedById;
}
