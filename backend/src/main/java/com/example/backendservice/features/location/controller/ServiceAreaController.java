package com.example.backendservice.features.location.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.location.dto.CreateServiceAreaRequest;
import com.example.backendservice.features.location.dto.ServiceAreaResponse;
import com.example.backendservice.features.location.service.ServiceAreaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/service-areas")
@RequiredArgsConstructor
@Tag(name = "Service Areas", description = "APIs for managing service areas")
public class ServiceAreaController {

    private final ServiceAreaService serviceAreaService;

    @PostMapping
    @Operation(summary = "Create a new service area")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> createServiceArea(
            @Valid @RequestBody CreateServiceAreaRequest request) {
        ServiceAreaResponse response = serviceAreaService.createServiceArea(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service area created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service area by ID")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> getServiceAreaById(@PathVariable UUID id) {
        ServiceAreaResponse response = serviceAreaService.getServiceAreaById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all service areas with pagination")
    public ResponseEntity<ApiResponse<Page<ServiceAreaResponse>>> getAllServiceAreas(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<ServiceAreaResponse> response = serviceAreaService.getAllServiceAreas(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a service area")
    public ResponseEntity<ApiResponse<ServiceAreaResponse>> updateServiceArea(
            @PathVariable UUID id,
            @Valid @RequestBody CreateServiceAreaRequest request) {
        ServiceAreaResponse response = serviceAreaService.updateServiceArea(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service area updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a service area")
    public ResponseEntity<ApiResponse<Void>> deleteServiceArea(@PathVariable UUID id) {
        serviceAreaService.deleteServiceArea(id);
        return ResponseEntity.ok(ApiResponse.success("Service area deleted successfully", null));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a service area")
    public ResponseEntity<ApiResponse<Void>> activateServiceArea(@PathVariable UUID id) {
        serviceAreaService.activateServiceArea(id);
        return ResponseEntity.ok(ApiResponse.success("Service area activated", null));
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a service area")
    public ResponseEntity<ApiResponse<Void>> deactivateServiceArea(@PathVariable UUID id) {
        serviceAreaService.deactivateServiceArea(id);
        return ResponseEntity.ok(ApiResponse.success("Service area deactivated", null));
    }
}
