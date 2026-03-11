package com.example.backendservice.features.location.controller;

import com.example.backendservice.features.location.dto.*;
import com.example.backendservice.features.location.service.ServiceAreaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/service-areas")
@RequiredArgsConstructor
@Tag(name = "Service Area", description = "APIs for managing service areas")
public class ServiceAreaController {

    private final ServiceAreaService serviceAreaService;

    @PostMapping
    @Operation(summary = "Create a new service area")
    public ResponseEntity<ServiceAreaResponse> createServiceArea(
            @Valid @RequestBody CreateServiceAreaRequest request) {
        ServiceAreaResponse response = serviceAreaService.createServiceArea(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{areaId}")
    @Operation(summary = "Get service area by ID")
    public ResponseEntity<ServiceAreaResponse> getServiceAreaById(@PathVariable UUID areaId) {
        ServiceAreaResponse response = serviceAreaService.getServiceAreaById(areaId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active service areas")
    public ResponseEntity<List<ServiceAreaResponse>> getAllActiveServiceAreas() {
        List<ServiceAreaResponse> response = serviceAreaService.getAllActiveServiceAreas();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all service areas with pagination")
    public ResponseEntity<Page<ServiceAreaResponse>> getAllServiceAreas(Pageable pageable) {
        Page<ServiceAreaResponse> response = serviceAreaService.getAllServiceAreas(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/city/{city}")
    @Operation(summary = "Get service areas by city")
    public ResponseEntity<Page<ServiceAreaResponse>> getServiceAreasByCity(
            @PathVariable String city,
            Pageable pageable) {
        Page<ServiceAreaResponse> response = serviceAreaService.getServiceAreasByCity(city, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/district/{districtCode}")
    @Operation(summary = "Get service areas by district code")
    public ResponseEntity<Page<ServiceAreaResponse>> getServiceAreasByDistrict(
            @PathVariable String districtCode,
            Pageable pageable) {
        Page<ServiceAreaResponse> response = serviceAreaService.getServiceAreasByDistrict(districtCode, pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{areaId}")
    @Operation(summary = "Update service area")
    public ResponseEntity<ServiceAreaResponse> updateServiceArea(
            @PathVariable UUID areaId,
            @Valid @RequestBody CreateServiceAreaRequest request) {
        ServiceAreaResponse response = serviceAreaService.updateServiceArea(areaId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{areaId}/deactivate")
    @Operation(summary = "Deactivate service area")
    public ResponseEntity<Void> deactivateServiceArea(@PathVariable UUID areaId) {
        serviceAreaService.deactivateServiceArea(areaId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{areaId}/activate")
    @Operation(summary = "Activate service area")
    public ResponseEntity<Void> activateServiceArea(@PathVariable UUID areaId) {
        serviceAreaService.activateServiceArea(areaId);
        return ResponseEntity.noContent().build();
    }
}
