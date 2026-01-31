package com.example.backendservice.features.auth.service;

import com.example.backendservice.features.auth.dto.AuthResponse;
import com.example.backendservice.features.auth.dto.LoginRequest;
import com.example.backendservice.features.auth.dto.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    void forgotPassword(String email);

    AuthResponse resetPassword(String email, String otp, String newPassword);
}
