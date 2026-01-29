package com.example.backendservice.features.user.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;

import com.example.backendservice.common.constants.AppConstants;
import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.auth.dto.RegisterRequest;
import com.example.backendservice.features.user.dto.UpdateUserRequest;
import com.example.backendservice.features.user.dto.UserResponse;
import com.example.backendservice.features.user.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse user = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PostMapping("/enterprise")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createEnterprise(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.createEnterprise(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Enterprise created successfully", response));
    }

    @PostMapping("/collector")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENTERPRISE')")
    public ResponseEntity<ApiResponse<UserResponse>> createCollector(
            @Valid @RequestBody RegisterRequest request,
            Authentication authentication) {

        String currentEmail = authentication.getName();
        boolean isEnterprise = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(AppConstants.ROLE_ENTERPRISE));

        Long enterpriseId = null;
        if (isEnterprise) {
            UserResponse currentUser = userService.getUserByEmail(currentEmail);
            enterpriseId = currentUser.getId();
        }

        UserResponse response = userService.createCollector(request, enterpriseId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Collector created successfully", response));
    }
}
