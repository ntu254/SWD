package com.example.backendservice.features.user.service;

import org.springframework.data.domain.Page;

import com.example.backendservice.features.user.dto.admin.AdminUserResponse;
import com.example.backendservice.features.user.dto.admin.CreateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRoleRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserStatusRequest;

import java.util.UUID;

public interface AdminUserService {

    AdminUserResponse createUser(CreateUserRequest request);

    Page<AdminUserResponse> getAllUsers(int page, int size, String search, String role, Boolean enabled, String status);

    AdminUserResponse getUserById(UUID id);

    AdminUserResponse updateUser(UUID id, UpdateUserRequest request);

    AdminUserResponse updateUserRole(UUID id, UpdateUserRoleRequest request);

    AdminUserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request);

    void deleteUser(UUID id);

    AdminUserResponse restoreUser(UUID id);
}
