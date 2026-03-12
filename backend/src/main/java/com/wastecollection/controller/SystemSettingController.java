package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.entity.SystemSetting;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.SystemSettingRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin - System Settings", description = "Manage system config key-value pairs")
public class SystemSettingController {

    private final SystemSettingRepository systemSettingRepository;

    @GetMapping
    @Operation(summary = "List all system settings")
    public ResponseEntity<ApiResponse<List<SystemSetting>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(systemSettingRepository.findAll()));
    }

    @GetMapping("/{key}")
    @Operation(summary = "Get a system setting by key")
    public ResponseEntity<ApiResponse<SystemSetting>> get(@PathVariable String key) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        return ResponseEntity.ok(ApiResponse.success(setting));
    }

    @PutMapping("/{key}")
    @Operation(summary = "Update a system setting value")
    public ResponseEntity<ApiResponse<SystemSetting>> update(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        SystemSetting setting = systemSettingRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("SystemSetting", "key", key));
        setting.setSettingValue(body.get("settingValue"));
        setting.setDescription(body.getOrDefault("description", setting.getDescription()));
        return ResponseEntity.ok(ApiResponse.success("Setting updated", systemSettingRepository.save(setting)));
    }

    @PostMapping
    @Operation(summary = "Create a new system setting")
    public ResponseEntity<ApiResponse<SystemSetting>> create(@RequestBody SystemSetting setting) {
        if (systemSettingRepository.existsById(setting.getSettingKey())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Setting key already exists"));
        }
        return ResponseEntity.status(201).body(ApiResponse.success("Setting created", systemSettingRepository.save(setting)));
    }

    @DeleteMapping("/{key}")
    @Operation(summary = "Delete a system setting")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String key) {
        if (!systemSettingRepository.existsById(key)) {
            throw new ResourceNotFoundException("SystemSetting", "key", key);
        }
        systemSettingRepository.deleteById(key);
        return ResponseEntity.ok(ApiResponse.success("Setting deleted", null));
    }
}
