package com.example.backendservice.features.enterprise.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.enterprise.dto.CreateEnterpriseRequest;
import com.example.backendservice.features.enterprise.dto.EnterpriseResponse;
import com.example.backendservice.features.enterprise.service.EnterpriseService;
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
@RequestMapping("/api/enterprises")
@RequiredArgsConstructor
@Tag(name = "Enterprises", description = "APIs for managing recycling enterprises")
public class EnterpriseController {

    private final EnterpriseService enterpriseService;

    @PostMapping
    @Operation(summary = "Create a new enterprise")
    public ResponseEntity<ApiResponse<EnterpriseResponse>> createEnterprise(
            @Valid @RequestBody CreateEnterpriseRequest request,
            @RequestHeader("X-User-Id") UUID ownerId) {
        EnterpriseResponse response = enterpriseService.createEnterprise(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Enterprise created successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get enterprise by ID")
    public ResponseEntity<ApiResponse<EnterpriseResponse>> getEnterpriseById(@PathVariable UUID id) {
        EnterpriseResponse response = enterpriseService.getEnterpriseById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping
    @Operation(summary = "Get all enterprises with pagination (Admin)")
    public ResponseEntity<ApiResponse<Page<EnterpriseResponse>>> getAllEnterprises(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<EnterpriseResponse> response = enterpriseService.getAllEnterprises(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my enterprise (Enterprise Owner)")
    public ResponseEntity<ApiResponse<EnterpriseResponse>> getMyEnterprise(
            @RequestHeader("X-User-Id") UUID ownerId) {
        EnterpriseResponse response = enterpriseService.getMyEnterprise(ownerId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an enterprise")
    public ResponseEntity<ApiResponse<EnterpriseResponse>> updateEnterprise(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEnterpriseRequest request) {
        EnterpriseResponse response = enterpriseService.updateEnterprise(id, request);
        return ResponseEntity.ok(ApiResponse.success("Enterprise updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an enterprise (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteEnterprise(@PathVariable UUID id) {
        enterpriseService.deleteEnterprise(id);
        return ResponseEntity.ok(ApiResponse.success("Enterprise deleted successfully", null));
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate an enterprise (Admin)")
    public ResponseEntity<ApiResponse<Void>> activateEnterprise(@PathVariable UUID id) {
        enterpriseService.activateEnterprise(id);
        return ResponseEntity.ok(ApiResponse.success("Enterprise activated", null));
    }

    @PatchMapping("/{id}/suspend")
    @Operation(summary = "Suspend an enterprise (Admin)")
    public ResponseEntity<ApiResponse<Void>> suspendEnterprise(@PathVariable UUID id) {
        enterpriseService.suspendEnterprise(id);
        return ResponseEntity.ok(ApiResponse.success("Enterprise suspended", null));
    }
}
