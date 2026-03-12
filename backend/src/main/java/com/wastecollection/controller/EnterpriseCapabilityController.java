package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.enterprise.CreateCapabilityRequest;
import com.wastecollection.dto.enterprise.EnterpriseCapabilityDto;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.EnterpriseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/enterprise/capabilities")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ENTERPRISE', 'ADMIN')")
@Tag(name = "Enterprise Capabilities", description = "Manage waste types, service areas, and capacity")
public class EnterpriseCapabilityController {

    private final EnterpriseService enterpriseService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "List all capabilities registered for this enterprise")
    public ResponseEntity<ApiResponse<List<EnterpriseCapabilityDto>>> getCapabilities() {
        return ResponseEntity.ok(ApiResponse.success(
                enterpriseService.getCapabilities(securityUtils.getCurrentUserId())));
    }

    @PostMapping
    @Operation(summary = "Register a new capability (waste type + service area + capacity)")
    public ResponseEntity<ApiResponse<EnterpriseCapabilityDto>> addCapability(
            @Valid @RequestBody CreateCapabilityRequest request) {
        EnterpriseCapabilityDto dto = enterpriseService.addCapability(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Capability added", dto));
    }

    @DeleteMapping("/{capabilityId}")
    @Operation(summary = "Remove a capability")
    public ResponseEntity<ApiResponse<Void>> deleteCapability(@PathVariable UUID capabilityId) {
        enterpriseService.deleteCapability(capabilityId);
        return ResponseEntity.ok(ApiResponse.success("Capability removed", null));
    }
}
