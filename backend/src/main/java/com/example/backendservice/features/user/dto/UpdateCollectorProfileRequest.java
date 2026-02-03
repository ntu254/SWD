package com.example.backendservice.features.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCollectorProfileRequest {
    private UUID assignedAreaId;
    private String vehicleType;
    private String vehiclePlate;
    private String phone;
    private String avatarUrl;
    private String firstName;
    private String lastName;
}
