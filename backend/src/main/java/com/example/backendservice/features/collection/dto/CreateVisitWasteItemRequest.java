package com.example.backendservice.features.collection.dto;

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
public class CreateVisitWasteItemRequest {

    @NotNull(message = "Waste Type ID is required")
    private UUID wasteTypeId;

    @NotNull(message = "Quantity in kg is required")
    private Double quantityKg;
}
