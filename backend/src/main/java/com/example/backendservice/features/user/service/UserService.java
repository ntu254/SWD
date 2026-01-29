package com.example.backendservice.features.user.service;

import java.util.List;

import com.example.backendservice.features.auth.dto.RegisterRequest;
import com.example.backendservice.features.user.dto.UpdateUserRequest;
import com.example.backendservice.features.user.dto.UserResponse;

public interface UserService {

    UserResponse getUserById(Long id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> getAllUsers();

    UserResponse updateUser(Long id, UpdateUserRequest request);



    UserResponse createEnterprise(RegisterRequest request);

    UserResponse createCollector(RegisterRequest request, Long enterpriseId);

    void deleteUser(Long id);
}
