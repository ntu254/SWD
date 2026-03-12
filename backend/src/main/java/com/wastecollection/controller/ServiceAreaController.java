package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.entity.ServiceArea;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.ServiceAreaRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Service Areas", description = "Manage service areas")
public class ServiceAreaController {

    private final ServiceAreaRepository serviceAreaRepository;

    @GetMapping("/api/service-areas")
    @Operation(summary = "Get all active service areas (public)")
    public ResponseEntity<ApiResponse<List<ServiceArea>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(serviceAreaRepository.findAll()));
    }

    @GetMapping("/api/service-areas/{areaId}")
    @Operation(summary = "Get service area by ID (public)")
    public ResponseEntity<ApiResponse<ServiceArea>> get(@PathVariable UUID areaId) {
        ServiceArea area = serviceAreaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", areaId));
        return ResponseEntity.ok(ApiResponse.success(area));
    }

    @PostMapping("/api/admin/service-areas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: create a service area")
    public ResponseEntity<ApiResponse<ServiceArea>> create(@Valid @RequestBody ServiceArea area) {
        ServiceArea saved = serviceAreaRepository.save(area);
        return ResponseEntity.status(201).body(ApiResponse.success("Service area created", saved));
    }

    @PutMapping("/api/admin/service-areas/{areaId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: update a service area")
    public ResponseEntity<ApiResponse<ServiceArea>> update(
            @PathVariable UUID areaId,
            @Valid @RequestBody ServiceArea request) {
        ServiceArea area = serviceAreaRepository.findById(areaId)
                .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", areaId));
        area.setName(request.getName());
        area.setGeoBoundaryWkt(request.getGeoBoundaryWkt());
        return ResponseEntity.ok(ApiResponse.success("Service area updated", serviceAreaRepository.save(area)));
    }

    @DeleteMapping("/api/admin/service-areas/{areaId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: delete a service area")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID areaId) {
        if (!serviceAreaRepository.existsById(areaId)) {
            throw new ResourceNotFoundException("ServiceArea", "id", areaId);
        }
        serviceAreaRepository.deleteById(areaId);
        return ResponseEntity.ok(ApiResponse.success("Service area deleted", null));
    }
}
