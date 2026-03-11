package com.example.backendservice.features.waste.controller;

import com.example.backendservice.features.waste.dto.*;
import com.example.backendservice.features.waste.service.WasteTypeService;
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
@RequestMapping("/api/v1/waste-types")
@RequiredArgsConstructor
@Tag(name = "Waste Type", description = "APIs for managing waste types")
public class WasteTypeController {

    private final WasteTypeService wasteTypeService;

    @PostMapping
    @Operation(summary = "Create a new waste type")
    public ResponseEntity<WasteTypeResponse> createWasteType(@Valid @RequestBody CreateWasteTypeRequest request) {
        WasteTypeResponse response = wasteTypeService.createWasteType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{typeId}")
    @Operation(summary = "Get waste type by ID")
    public ResponseEntity<WasteTypeResponse> getWasteTypeById(@PathVariable UUID typeId) {
        WasteTypeResponse response = wasteTypeService.getWasteTypeById(typeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get waste type by code")
    public ResponseEntity<WasteTypeResponse> getWasteTypeByCode(@PathVariable String code) {
        WasteTypeResponse response = wasteTypeService.getWasteTypeByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    @Operation(summary = "Get all active waste types")
    public ResponseEntity<List<WasteTypeResponse>> getAllActiveWasteTypes() {
        List<WasteTypeResponse> response = wasteTypeService.getAllActiveWasteTypes();
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get all waste types with pagination")
    public ResponseEntity<Page<WasteTypeResponse>> getAllWasteTypes(Pageable pageable) {
        Page<WasteTypeResponse> response = wasteTypeService.getAllWasteTypes(pageable);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{typeId}")
    @Operation(summary = "Update waste type")
    public ResponseEntity<WasteTypeResponse> updateWasteType(
            @PathVariable UUID typeId,
            @Valid @RequestBody CreateWasteTypeRequest request) {
        WasteTypeResponse response = wasteTypeService.updateWasteType(typeId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{typeId}/deactivate")
    @Operation(summary = "Deactivate waste type")
    public ResponseEntity<Void> deactivateWasteType(@PathVariable UUID typeId) {
        wasteTypeService.deactivateWasteType(typeId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{typeId}/activate")
    @Operation(summary = "Activate waste type")
    public ResponseEntity<Void> activateWasteType(@PathVariable UUID typeId) {
        wasteTypeService.activateWasteType(typeId);
        return ResponseEntity.noContent().build();
    }
}
