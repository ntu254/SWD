package com.example.backendservice.features.collection.service;

import com.example.backendservice.features.collection.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface CollectionVisitService {

    // Visit CRUD
    CollectionVisitResponse startVisit(UUID collectorUserId, CreateCollectionVisitRequest request);

    CollectionVisitResponse completeVisit(UUID visitId);

    CollectionVisitResponse getVisitById(UUID visitId);

    Page<CollectionVisitResponse> getVisitsByCollector(UUID collectorUserId, Pageable pageable);

    Page<CollectionVisitResponse> getVisitsByTask(UUID taskId, Pageable pageable);

    Page<CollectionVisitResponse> getAllVisits(Pageable pageable);

    // Waste items
    VisitWasteItemResponse addWasteItem(UUID visitId, CreateVisitWasteItemRequest request);

    void removeWasteItem(UUID itemId);

    // Evidence photos
    EvidencePhotoResponse uploadEvidencePhoto(CreateEvidencePhotoRequest request);

    void deleteEvidencePhoto(UUID photoId);

    // Rating
    CollectionVisitResponse rateVisit(UUID visitId, RateVisitRequest request);
}
