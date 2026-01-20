package com.example.backendservice.features.user.service;

import com.example.backendservice.features.user.dto.UpdateUserRequest;
import com.example.backendservice.features.user.dto.UserResponse;

import java.util.List;

public interface UserService {

    UserResponse getUserById(Long id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);
}
