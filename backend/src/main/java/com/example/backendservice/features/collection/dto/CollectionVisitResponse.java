package com.example.backendservice.features.collection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionVisitResponse {
    private UUID visitId;
    private UUID taskId;
    private UUID collectorUserId;
    private String collectorName;
    private LocalDateTime arrivedAt;
    private LocalDateTime completedAt;
    private String citizenSignature;
    private Integer rating;
    private String feedback;
    private LocalDateTime createdAt;

    private List<VisitWasteItemResponse> wasteItems;
    private List<EvidencePhotoResponse> evidencePhotos;
}
