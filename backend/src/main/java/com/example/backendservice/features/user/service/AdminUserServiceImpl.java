package com.example.backendservice.features.user.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.user.dto.admin.*;
import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of AdminUserService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AdminUserResponse createUser(CreateUserRequest request) {
        log.info("Admin creating user with email: {}", request.getEmail());

        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(RoleType.valueOf(request.getRole()))
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("User created: {}", user.getUserId());

        return toResponse(user);
    }

    @Override
    public Page<AdminUserResponse> getAllUsers(int page, int size, String search, String role, Boolean enabled,
            String status) {
        log.debug("Getting all users with filters - page: {}, size: {}, search: {}, role: {}, status: {}",
                page, size, search, role, status);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Get all users and filter
        List<User> allUsers = userRepository.findAll();

        List<User> filtered = allUsers.stream()
                .filter(u -> {
                    if (search != null && !search.isEmpty()) {
                        String searchLower = search.toLowerCase();
                        return (u.getEmail() != null && u.getEmail().toLowerCase().contains(searchLower)) ||
                                (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(searchLower)) ||
                                (u.getLastName() != null && u.getLastName().toLowerCase().contains(searchLower));
                    }
                    return true;
                })
                .filter(u -> {
                    if (role != null && !role.isEmpty()) {
                        return u.getRole() != null && u.getRole().name().equalsIgnoreCase(role);
                    }
                    return true;
                })
                .filter(u -> {
                    if (status != null && !status.isEmpty()) {
                        return u.getAccountStatus() != null && u.getAccountStatus().name().equalsIgnoreCase(status);
                    }
                    return true;
                })
                .filter(u -> {
                    if (enabled != null) {
                        boolean isEnabled = u.getAccountStatus() == AccountStatus.ACTIVE;
                        return enabled.equals(isEnabled);
                    }
                    return true;
                })
                .collect(Collectors.toList());

        List<AdminUserResponse> responses = filtered.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        // Manual pagination
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());

        if (start > responses.size()) {
            return new PageImpl<>(List.of(), pageable, responses.size());
        }

        return new PageImpl<>(
                responses.subList(start, end),
                pageable,
                responses.size());
    }

    @Override
    public AdminUserResponse getUserById(UUID id) {
        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return toResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(UUID id, UpdateUserRequest request) {
        log.info("Updating user: {}", id);

        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // Check if new email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new IllegalArgumentException("Email already exists: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        user = userRepository.save(user);
        log.info("User updated: {}", id);

        return toResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(UUID id, UpdateUserRoleRequest request) {
        log.info("Updating user role: {} to {}", id, request.getRole());

        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setRole(RoleType.valueOf(request.getRole()));
        user = userRepository.save(user);

        log.info("User role updated: {}", id);
        return toResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request) {
        log.info("Updating user status: {} to {}", id, request.getAccountStatus());

        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setAccountStatus(AccountStatus.valueOf(request.getAccountStatus()));
        user = userRepository.save(user);

        log.info("User status updated: {}", id);
        return toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        log.info("Deleting user: {}", id);

        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        // Soft delete
        user.setAccountStatus(AccountStatus.PENDING_DELETE);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);

        log.info("User deleted: {}", id);
    }

    @Override
    @Transactional
    public AdminUserResponse restoreUser(UUID id) {
        log.info("Restoring user: {}", id);

        User user = userRepository.findByUserId(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setDeletedAt(null);
        user = userRepository.save(user);

        log.info("User restored: {}", id);
        return toResponse(user);
    }

    private AdminUserResponse toResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userCode(null) // Not in current entity
                .role(user.getRole() != null ? user.getRole().name() : null)
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : null)
                .enabled(user.getAccountStatus() == AccountStatus.ACTIVE)
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .deletedAt(user.getDeletedAt())
                .deleteScheduledAt(null) // Not in current entity
                .banReason(null) // Not in current entity
                .build();
    }
}
