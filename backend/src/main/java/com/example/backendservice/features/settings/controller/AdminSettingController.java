package com.example.backendservice.features.settings.controller;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.settings.dto.SettingDTO;
import com.example.backendservice.features.settings.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
@Tag(name = "System Settings", description = "APIs for managing global system configurations (Admin only)")
public class AdminSettingController {

    private final SystemSettingService systemSettingService;

    @Operation(summary = "Get all system settings")
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SettingDTO>>> getAllSettings() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.getAllSettings()));
    }

    @Operation(summary = "Get a specific setting by key")
    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingDTO>> getSetting(@PathVariable String key) {
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.getSetting(key)));
    }

    @Operation(summary = "Update a setting value")
    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SettingDTO>> updateSetting(
            @PathVariable String key,
            @RequestParam String value) {
        return ResponseEntity.ok(ApiResponse.success(systemSettingService.updateSetting(key, value)));
    }
}
