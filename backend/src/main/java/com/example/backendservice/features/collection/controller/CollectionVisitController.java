package com.example.backendservice.features.collection.controller;

import com.example.backendservice.features.collection.dto.*;
import com.example.backendservice.features.collection.service.CollectionVisitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/collection-visits")
@RequiredArgsConstructor
@Tag(name = "Collection Visit", description = "APIs for managing collection visits")
public class CollectionVisitController {

    private final CollectionVisitService collectionVisitService;

    @PostMapping
    @Operation(summary = "Start a new collection visit")
    public ResponseEntity<CollectionVisitResponse> startVisit(
            @RequestHeader("X-User-Id") UUID collectorUserId,
            @Valid @RequestBody CreateCollectionVisitRequest request) {
        CollectionVisitResponse response = collectionVisitService.startVisit(collectorUserId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{visitId}/complete")
    @Operation(summary = "Complete a collection visit")
    public ResponseEntity<CollectionVisitResponse> completeVisit(@PathVariable UUID visitId) {
        CollectionVisitResponse response = collectionVisitService.completeVisit(visitId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{visitId}")
    @Operation(summary = "Get visit by ID")
    public ResponseEntity<CollectionVisitResponse> getVisitById(@PathVariable UUID visitId) {
        CollectionVisitResponse response = collectionVisitService.getVisitById(visitId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/collector/{collectorUserId}")
    @Operation(summary = "Get visits by collector")
    public ResponseEntity<Page<CollectionVisitResponse>> getVisitsByCollector(
            @PathVariable UUID collectorUserId,
            Pageable pageable) {
        Page<CollectionVisitResponse> response = collectionVisitService.getVisitsByCollector(collectorUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @Operation(summary = "Get my visits (for collector)")
    public ResponseEntity<Page<CollectionVisitResponse>> getMyVisits(
            @RequestHeader("X-User-Id") UUID collectorUserId,
            Pageable pageable) {
        Page<CollectionVisitResponse> response = collectionVisitService.getVisitsByCollector(collectorUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/task/{taskId}")
    @Operation(summary = "Get visits by task")
    public ResponseEntity<Page<CollectionVisitResponse>> getVisitsByTask(
            @PathVariable UUID taskId,
            Pageable pageable) {
        Page<CollectionVisitResponse> response = collectionVisitService.getVisitsByTask(taskId, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all visits")
    public ResponseEntity<Page<CollectionVisitResponse>> getAllVisits(Pageable pageable) {
        Page<CollectionVisitResponse> response = collectionVisitService.getAllVisits(pageable);
        return ResponseEntity.ok(response);
    }

    // Waste items
    @PostMapping("/{visitId}/waste-items")
    @Operation(summary = "Add waste item to visit")
    public ResponseEntity<VisitWasteItemResponse> addWasteItem(
            @PathVariable UUID visitId,
            @Valid @RequestBody CreateVisitWasteItemRequest request) {
        VisitWasteItemResponse response = collectionVisitService.addWasteItem(visitId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/waste-items/{itemId}")
    @Operation(summary = "Remove waste item")
    public ResponseEntity<Void> removeWasteItem(@PathVariable UUID itemId) {
        collectionVisitService.removeWasteItem(itemId);
        return ResponseEntity.noContent().build();
    }

    // Evidence photos
    @PostMapping("/evidence-photos")
    @Operation(summary = "Upload evidence photo")
    public ResponseEntity<EvidencePhotoResponse> uploadEvidencePhoto(
            @Valid @RequestBody CreateEvidencePhotoRequest request) {
        EvidencePhotoResponse response = collectionVisitService.uploadEvidencePhoto(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/evidence-photos/{photoId}")
    @Operation(summary = "Delete evidence photo")
    public ResponseEntity<Void> deleteEvidencePhoto(@PathVariable UUID photoId) {
        collectionVisitService.deleteEvidencePhoto(photoId);
        return ResponseEntity.noContent().build();
    }

    // Rating
    @PostMapping("/{visitId}/rate")
    @Operation(summary = "Rate a collection visit")
    public ResponseEntity<CollectionVisitResponse> rateVisit(
            @PathVariable UUID visitId,
            @Valid @RequestBody RateVisitRequest request) {
        CollectionVisitResponse response = collectionVisitService.rateVisit(visitId, request);
        return ResponseEntity.ok(response);
    }
}
