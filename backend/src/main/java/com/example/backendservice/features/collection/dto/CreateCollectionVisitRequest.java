package com.example.backendservice.features.collection.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCollectionVisitRequest {

    @NotNull(message = "Task ID is required")
    private UUID taskId;

    private String citizenSignature;

    private List<CreateVisitWasteItemRequest> wasteItems;
}
