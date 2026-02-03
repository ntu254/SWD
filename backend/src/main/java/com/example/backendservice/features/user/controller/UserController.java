package com.example.backendservice.features.user.controller;

import com.example.backendservice.features.user.dto.*;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Get user by email")
    public ResponseEntity<UserResponse> getUserByEmail(@PathVariable String email) {
        UserResponse response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Delete user (soft delete)")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Get all users with pagination")
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get users by role")
    public ResponseEntity<Page<UserResponse>> getUsersByRole(
            @PathVariable RoleType role,
            Pageable pageable) {
        Page<UserResponse> response = userService.getUsersByRole(role, pageable);
        return ResponseEntity.ok(response);
    }

    // Citizen Profile endpoints
    @GetMapping("/{userId}/citizen-profile")
    @Operation(summary = "Get citizen profile")
    public ResponseEntity<CitizenProfileResponse> getCitizenProfile(@PathVariable UUID userId) {
        CitizenProfileResponse response = userService.getCitizenProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/citizen-profile")
    @Operation(summary = "Update citizen profile")
    public ResponseEntity<CitizenProfileResponse> updateCitizenProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateCitizenProfileRequest request) {
        CitizenProfileResponse response = userService.updateCitizenProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    // Collector Profile endpoints
    @GetMapping("/{userId}/collector-profile")
    @Operation(summary = "Get collector profile")
    public ResponseEntity<CollectorProfileResponse> getCollectorProfile(@PathVariable UUID userId) {
        CollectorProfileResponse response = userService.getCollectorProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}/collector-profile")
    @Operation(summary = "Update collector profile")
    public ResponseEntity<CollectorProfileResponse> updateCollectorProfile(
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateCollectorProfileRequest request) {
        CollectorProfileResponse response = userService.updateCollectorProfile(userId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/collector-profile/location")
    @Operation(summary = "Update collector location")
    public ResponseEntity<CollectorProfileResponse> updateCollectorLocation(
            @PathVariable UUID userId,
            @RequestParam Double lat,
            @RequestParam Double lng) {
        CollectorProfileResponse response = userService.updateCollectorLocation(userId, lat, lng);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{userId}/collector-profile/availability")
    @Operation(summary = "Set collector availability")
    public ResponseEntity<CollectorProfileResponse> setCollectorAvailability(
            @PathVariable UUID userId,
            @RequestParam Boolean isAvailable) {
        CollectorProfileResponse response = userService.setCollectorAvailability(userId, isAvailable);
        return ResponseEntity.ok(response);
    }

    // Password management
    @PostMapping("/{userId}/change-password")
    @Operation(summary = "Change user password")
    public ResponseEntity<Void> changePassword(
            @PathVariable UUID userId,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Request password reset")
    public ResponseEntity<Void> resetPassword(@RequestParam String email) {
        userService.resetPassword(email);
        return ResponseEntity.ok().build();
    }
}
