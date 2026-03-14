package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.dto.enterprise.KpiConfigDto;
import com.wastecollection.dto.enterprise.KpiConfigRequest;
import com.wastecollection.dto.user.UpdateProfileRequest;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.security.SecurityUtils;
import com.wastecollection.service.EnterpriseService;
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
@RequestMapping("/api/enterprise")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ENTERPRISE', 'ADMIN')")
@Tag(name = "Enterprise - Collectors & KPI", description = "Manage collectors and configure daily KPI targets")
public class EnterpriseKpiController {

    private final EnterpriseService enterpriseService;
    private final SecurityUtils securityUtils;

    @GetMapping("/collectors")
    @Operation(summary = "List collectors belonging to this enterprise")
    public ResponseEntity<ApiResponse<List<UserDto>>> getCollectors() {
        List<UserDto> collectors = enterpriseService.getCollectors(securityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(collectors));
    }

    @PutMapping("/collectors/{collectorUserId}")
    @Operation(summary = "Update a collector's profile (name, display name, phone)")
    public ResponseEntity<ApiResponse<UserDto>> updateCollector(
            @PathVariable UUID collectorUserId,
            @RequestBody UpdateProfileRequest request) {
        UserDto dto = enterpriseService.updateCollector(
                securityUtils.getCurrentUserId(), collectorUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Collector updated", dto));
    }

    @DeleteMapping("/collectors/{collectorUserId}")
    @Operation(summary = "Deactivate a collector account (sets status to DISABLED)")
    public ResponseEntity<ApiResponse<Void>> deactivateCollector(
            @PathVariable UUID collectorUserId) {
        enterpriseService.deactivateCollector(securityUtils.getCurrentUserId(), collectorUserId);
        return ResponseEntity.ok(ApiResponse.success("Collector deactivated", null));
    }

    @PostMapping("/collectors/kpi")
    @Operation(summary = "Set or update daily KPI targets for a collector (min visits + min weight)")
    public ResponseEntity<ApiResponse<KpiConfigDto>> setKpi(
            @Valid @RequestBody KpiConfigRequest request) {
        KpiConfigDto dto = enterpriseService.setCollectorKpi(securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("KPI configured", dto));
    }

    @PostMapping("/collectors/kpi/all")
    @Operation(summary = "Set or update daily KPI targets for all collectors in this enterprise")
    public ResponseEntity<ApiResponse<List<KpiConfigDto>>> setKpiForAllCollectors(
            @Valid @RequestBody KpiConfigRequest request) {
        List<KpiConfigDto> dtos = enterpriseService.setAllCollectorsKpi(
                securityUtils.getCurrentUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("KPI configured for all collectors", dtos));
    }

    @GetMapping("/collectors/{collectorId}/kpi")
    @Operation(summary = "View KPI history for a specific collector")
    public ResponseEntity<ApiResponse<List<KpiConfigDto>>> getKpiHistory(
            @PathVariable UUID collectorId) {
        return ResponseEntity.ok(ApiResponse.success(
                enterpriseService.getCollectorKpiHistory(collectorId)));
    }
}
