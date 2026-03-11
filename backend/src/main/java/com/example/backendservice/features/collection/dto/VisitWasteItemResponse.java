package com.example.backendservice.features.collection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitWasteItemResponse {
    private UUID itemId;
    private UUID visitId;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private Double quantityKg;
    private Integer pointsAwarded;
}
