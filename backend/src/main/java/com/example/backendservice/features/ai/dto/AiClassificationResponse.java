package com.example.backendservice.features.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiClassificationResponse {
    private UUID wasteTypeId;
    private String wasteTypeName;
    private String confidence;
    private String explanation;
    private java.util.List<String> recyclingSteps;
}
