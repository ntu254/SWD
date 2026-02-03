package com.example.backendservice.features.collection.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidencePhotoResponse {
    private UUID photoId;
    private UUID visitId;
    private String photoUrl;
    private String photoType; // BEFORE, AFTER
    private LocalDateTime uploadedAt;
}
