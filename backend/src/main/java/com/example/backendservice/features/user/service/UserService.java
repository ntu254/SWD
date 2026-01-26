package com.example.backendservice.features.user.service;

import java.util.List;
import java.util.UUID;

import com.example.backendservice.features.user.dto.UpdateUserRequest;
import com.example.backendservice.features.user.dto.UserResponse;

public interface UserService {

    UserResponse getUserById(UUID id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(UUID id, UpdateUserRequest request);

    void deleteUser(UUID id);
}
