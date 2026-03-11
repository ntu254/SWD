package com.example.backendservice.features.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backendservice.common.dto.ApiResponse;
import com.example.backendservice.features.auth.dto.AuthResponse;
import com.example.backendservice.features.auth.dto.LoginRequest;
import com.example.backendservice.features.auth.dto.RegisterRequest;
import com.example.backendservice.features.auth.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "APIs for user registration and login")

public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register new user", description = "Register a new user account. Default role is CITIZEN if not specified.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "User registered successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Email already registered or invalid request")
    })
    @PostMapping("/register")

    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("[AUTH_CONTROLLER] Register request for: {}", request.getEmail());
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", response));
    }

    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Login successful"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Invalid credentials")
    })
    @PostMapping("/login")

    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        log.info("[AUTH_CONTROLLER] Login request for: {}", request.getEmail());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Forgot password", description = "Send OTP to user's email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        log.info("[AUTH_CONTROLLER] Forgot password request for: {}", email);
        authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to your email", null));
    }

    @Operation(summary = "Reset password", description = "Reset password using OTP")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<AuthResponse>> resetPassword(@RequestBody ResetPasswordRequest request) {
        log.info("[AUTH_CONTROLLER] Reset password request for: {}", request.getEmail());
        AuthResponse response = authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password reset successful", response));
    }

    @Operation(summary = "Refresh token", description = "Get new access token using refresh token")
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody RefreshTokenRequest request) {
        log.info("[AUTH_CONTROLLER] Refresh token request");
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }
    @lombok.Data
    public static class ResetPasswordRequest {
        @jakarta.validation.constraints.Email
        @jakarta.validation.constraints.NotBlank
        private String email;
        
        @jakarta.validation.constraints.NotBlank
        private String otp;
        
        @jakarta.validation.constraints.NotBlank
        @jakarta.validation.constraints.Size(min = 6)
        private String newPassword;
    }
    @lombok.Data
    public static class RefreshTokenRequest {
        @jakarta.validation.constraints.NotBlank
        private String refreshToken;
    }
    @Operation(summary = "Logout", description = "Logout user and invalidate refresh token")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(java.security.Principal principal) {
        if (principal != null) {
            log.info("[AUTH_CONTROLLER] Logout request for: {}", principal.getName());
            authService.logout(principal.getName());
        }
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }
}
