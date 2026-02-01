package com.example.backendservice.features.enterprise.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.enterprise.dto.CapabilityResponse;
import com.example.backendservice.features.enterprise.dto.CreateCapabilityRequest;
import com.example.backendservice.features.enterprise.service.EnterpriseCapabilityService;
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
@RequestMapping("/api/v1/enterprises/{enterpriseId}/capabilities")
@RequiredArgsConstructor
@Tag(name = "Enterprise Capabilities", description = "APIs for managing enterprise processing capabilities")
public class EnterpriseCapabilityController {

    private final EnterpriseCapabilityService capabilityService;

    @PostMapping
    @Operation(summary = "Create a new capability for enterprise")
    public ResponseEntity<ApiResponse<CapabilityResponse>> createCapability(
            @PathVariable UUID enterpriseId,
            @Valid @RequestBody CreateCapabilityRequest request) {
        CapabilityResponse response = capabilityService.createCapability(enterpriseId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Capability created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all capabilities of an enterprise")
    public ResponseEntity<ApiResponse<List<CapabilityResponse>>> getCapabilitiesByEnterprise(
            @PathVariable UUID enterpriseId) {
        List<CapabilityResponse> response = capabilityService.getCapabilitiesByEnterprise(enterpriseId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{capabilityId}")
    @Operation(summary = "Get capability by ID")
    public ResponseEntity<ApiResponse<CapabilityResponse>> getCapabilityById(
            @PathVariable UUID enterpriseId,
            @PathVariable UUID capabilityId) {
        CapabilityResponse response = capabilityService.getCapabilityById(capabilityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{capabilityId}")
    @Operation(summary = "Update a capability")
    public ResponseEntity<ApiResponse<CapabilityResponse>> updateCapability(
            @PathVariable UUID enterpriseId,
            @PathVariable UUID capabilityId,
            @Valid @RequestBody CreateCapabilityRequest request) {
        CapabilityResponse response = capabilityService.updateCapability(capabilityId, request);
        return ResponseEntity.ok(ApiResponse.success("Capability updated successfully", response));
    }

    @DeleteMapping("/{capabilityId}")
    @Operation(summary = "Delete a capability (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteCapability(
            @PathVariable UUID enterpriseId,
            @PathVariable UUID capabilityId) {
        capabilityService.deleteCapability(capabilityId);
        return ResponseEntity.ok(ApiResponse.success("Capability deleted successfully", null));
    }
}
