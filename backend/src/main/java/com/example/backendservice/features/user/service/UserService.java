package com.example.backendservice.features.user.service;

import com.example.backendservice.features.user.dto.*;
import com.example.backendservice.features.user.entity.RoleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    // User CRUD
    UserResponse createUser(CreateUserRequest request);

    UserResponse getUserById(UUID userId);

    UserResponse getUserByEmail(String email);

    UserResponse updateUser(UUID userId, UpdateUserRequest request);

    void deleteUser(UUID userId);

    // User listing
    Page<UserResponse> getAllUsers(Pageable pageable);

    Page<UserResponse> getUsersByRole(RoleType role, Pageable pageable);

    // Citizen profile
    CitizenProfileResponse getCitizenProfile(UUID userId);

    CitizenProfileResponse updateCitizenProfile(UUID userId, UpdateCitizenProfileRequest request);

    // Collector profile
    CollectorProfileResponse getCollectorProfile(UUID userId);

    CollectorProfileResponse updateCollectorProfile(UUID userId, UpdateCollectorProfileRequest request);

    CollectorProfileResponse updateCollectorLocation(UUID userId, Double lat, Double lng);

    CollectorProfileResponse setCollectorAvailability(UUID userId, Boolean isAvailable);

    // Password management
    void changePassword(UUID userId, String oldPassword, String newPassword);

    void resetPassword(String email);
}
