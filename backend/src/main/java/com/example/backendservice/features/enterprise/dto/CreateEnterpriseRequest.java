package com.example.backendservice.features.enterprise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateEnterpriseRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private String logoUrl;

    @Size(max = 500, message = "Address must be less than 500 characters")
    private String address;

    @Size(max = 20, message = "Phone must be less than 20 characters")
    private String phone;

    private String email;
    private String taxCode;
    private UUID primaryAreaId;
}
