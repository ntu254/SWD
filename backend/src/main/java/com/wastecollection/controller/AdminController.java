package com.wastecollection.controller;

import com.wastecollection.common.ApiResponse;
import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.admin.DashboardStatsDto;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.service.AdminService;
import com.wastecollection.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only endpoints for users, dashboard, settings")
public class AdminController {

    private final AdminService adminService;
    private final UserService userService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get system-wide dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    @Operation(summary = "List all users with optional filters")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> listUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(userService.listUsers(page, size, role, status)));
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "Get a specific user by ID")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userId)));
    }

    @PutMapping("/users/{userId}/status")
    @Operation(summary = "Update user account status (ACTIVE, DISABLED, BANNED)")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam String status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                userService.updateUserStatus(userId, status)));
    }

    @PutMapping("/users/{userId}/role")
    @Operation(summary = "Assign a role to a user")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.success("Role updated",
                userService.updateUserRole(userId, role)));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Soft-delete a user (sets status to PENDING_DELETE)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }

    @GetMapping("/enterprises")
    @Operation(summary = "List all enterprise users")
    public ResponseEntity<ApiResponse<PageResponse<UserDto>>> listEnterprises(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.success(userService.listUsers(page, size, "ENTERPRISE", null)));
    }
}
