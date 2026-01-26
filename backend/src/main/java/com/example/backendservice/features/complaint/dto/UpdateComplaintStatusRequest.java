package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateComplaintStatusRequest {

    private UUID resolvedById;

    public String getStatus() {
        return status;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public UUID getResolvedById() {
        return resolvedById;
    }
}
