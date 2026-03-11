package com.example.backendservice.features.collector.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for uploading proof image and creating the collection visit payload
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadProofRequest {

    @NotBlank(message = "Proof image URL is required")
    private String collectorProofImageUrl;
    
    private String wasteTypeId;
    
    private Double weightKg;
}
