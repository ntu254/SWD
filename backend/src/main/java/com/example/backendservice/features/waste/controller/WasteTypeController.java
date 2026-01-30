package com.example.backendservice.features.waste.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.waste.dto.CreateWasteTypeRequest;
import com.example.backendservice.features.waste.dto.WasteTypeResponse;
import com.example.backendservice.features.waste.service.WasteTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/waste-types")
@RequiredArgsConstructor
@Tag(name = "Waste Types", description = "APIs for managing waste types")
public class WasteTypeController {

    private final WasteTypeService wasteTypeService;

    @PostMapping
    @Operation(summary = "Create a new waste type (Admin)")
    public ResponseEntity<ApiResponse<WasteTypeResponse>> createWasteType(
            @Valid @RequestBody CreateWasteTypeRequest request) {
        WasteTypeResponse response = wasteTypeService.createWasteType(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Waste type created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get waste type by ID")
    public ResponseEntity<ApiResponse<WasteTypeResponse>> getWasteTypeById(@PathVariable UUID id) {
        WasteTypeResponse response = wasteTypeService.getWasteTypeById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all waste types")
    public ResponseEntity<ApiResponse<List<WasteTypeResponse>>> getAllWasteTypes(
            @RequestParam(required = false) String status) {
        List<WasteTypeResponse> response = wasteTypeService.getAllWasteTypes(status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a waste type (Admin)")
    public ResponseEntity<ApiResponse<WasteTypeResponse>> updateWasteType(
            @PathVariable UUID id,
            @Valid @RequestBody CreateWasteTypeRequest request) {
        WasteTypeResponse response = wasteTypeService.updateWasteType(id, request);
        return ResponseEntity.ok(ApiResponse.success("Waste type updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a waste type (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteWasteType(@PathVariable UUID id) {
        wasteTypeService.deleteWasteType(id);
        return ResponseEntity.ok(ApiResponse.success("Waste type deleted successfully", null));
    }
}
