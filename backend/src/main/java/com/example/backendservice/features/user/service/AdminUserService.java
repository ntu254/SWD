package com.example.backendservice.features.user.service;

import org.springframework.data.domain.Page;

import com.example.backendservice.features.user.dto.admin.AdminUserResponse;
import com.example.backendservice.features.user.dto.admin.CreateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRoleRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserStatusRequest;

public interface AdminUserService {

    AdminUserResponse createUser(CreateUserRequest request);

    Page<AdminUserResponse> getAllUsers(int page, int size, String search, String role, Boolean enabled, String status);

    AdminUserResponse getUserById(Long id);

    AdminUserResponse updateUser(Long id, UpdateUserRequest request);

    AdminUserResponse updateUserRole(Long id, UpdateUserRoleRequest request);

    AdminUserResponse updateUserStatus(Long id, UpdateUserStatusRequest request);

    void deleteUser(Long id);

    AdminUserResponse restoreUser(Long id);
}
