package com.example.backendservice.features.user.service;

import java.util.List;

import com.example.backendservice.features.user.dto.UpdateUserRequest;
import com.example.backendservice.features.user.dto.UserResponse;

public interface UserService {

    UserResponse getUserById(Long id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, UpdateUserRequest request);

    void deleteUser(Long id);
}
