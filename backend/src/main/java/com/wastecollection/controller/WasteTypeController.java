package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.entity.WasteType;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.WasteTypeRepository;
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
@Tag(name = "Waste Types", description = "Manage waste type catalog")
public class WasteTypeController {

    private final WasteTypeRepository wasteTypeRepository;

    @GetMapping("/api/waste-types")
    @Operation(summary = "Get all active waste types (public)")
    public ResponseEntity<ApiResponse<List<WasteType>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(
                wasteTypeRepository.findByIsActiveTrue()));
    }

    @GetMapping("/api/waste-types/{wasteTypeId}")
    @Operation(summary = "Get waste type by ID (public)")
    public ResponseEntity<ApiResponse<WasteType>> get(@PathVariable UUID wasteTypeId) {
        WasteType wt = wasteTypeRepository.findById(wasteTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", wasteTypeId));
        return ResponseEntity.ok(ApiResponse.success(wt));
    }

    @PostMapping("/api/admin/waste-types")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: create a waste type")
    public ResponseEntity<ApiResponse<WasteType>> create(@Valid @RequestBody WasteType wasteType) {
        WasteType saved = wasteTypeRepository.save(wasteType);
        return ResponseEntity.status(201).body(ApiResponse.success("Waste type created", saved));
    }

    @PutMapping("/api/admin/waste-types/{wasteTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: update a waste type")
    public ResponseEntity<ApiResponse<WasteType>> update(
            @PathVariable UUID wasteTypeId,
            @Valid @RequestBody WasteType request) {
        WasteType wt = wasteTypeRepository.findById(wasteTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", wasteTypeId));
        wt.setName(request.getName());
        wt.setDescription(request.getDescription());
        wt.setIsActive(request.getIsActive());
        wt.setIsRecyclable(request.getIsRecyclable());
        return ResponseEntity.ok(ApiResponse.success("Waste type updated", wasteTypeRepository.save(wt)));
    }

    @DeleteMapping("/api/admin/waste-types/{wasteTypeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: deactivate a waste type")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable UUID wasteTypeId) {
        WasteType wt = wasteTypeRepository.findById(wasteTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteType", "id", wasteTypeId));
        wt.setIsActive(false);
        wasteTypeRepository.save(wt);
        return ResponseEntity.ok(ApiResponse.success("Waste type deactivated", null));
    }
}
