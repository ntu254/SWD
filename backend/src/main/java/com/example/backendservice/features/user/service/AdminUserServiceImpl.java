package com.example.backendservice.features.user.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backendservice.common.exception.BadRequestException;
import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.user.dto.admin.AdminUserResponse;
import com.example.backendservice.features.user.dto.admin.CreateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserRoleRequest;
import com.example.backendservice.features.user.dto.admin.UpdateUserStatusRequest;
import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AdminUserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        if (StringUtils.hasText(request.getPhone()) && userRepository.existsByPhone(request.getPhone())) {
            throw new BadRequestException("Phone number already exists");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .enabled(true)
                .accountStatus(AccountStatus.ACTIVE)
                .userCode(UUID.randomUUID().toString())
                .build();

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Override
    public Page<AdminUserResponse> getAllUsers(int page, int size, String search, String role, Boolean enabled,
            String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Handle status filter for PENDING_DELETE users
            if (StringUtils.hasText(status)) {
                try {
                    AccountStatus accountStatus = AccountStatus.valueOf(status.toUpperCase());
                    predicates.add(cb.equal(root.get("accountStatus"), accountStatus));
                } catch (IllegalArgumentException e) {
                    // Invalid status, ignore filter
                }
            } else {
                // Default: Exclude PENDING_DELETE users
                predicates.add(cb.notEqual(root.get("accountStatus"), AccountStatus.PENDING_DELETE));
            }

            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                Predicate firstName = cb.like(cb.lower(root.get("firstName")), searchLike);
                Predicate lastName = cb.like(cb.lower(root.get("lastName")), searchLike);
                Predicate email = cb.like(cb.lower(root.get("email")), searchLike);
                Predicate userCode = cb.like(cb.lower(root.get("userCode")), searchLike);
                Predicate phone = cb.like(cb.lower(root.get("phone")), searchLike);

                predicates.add(cb.or(firstName, lastName, email, userCode, phone));
            }

            if (StringUtils.hasText(role)) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (enabled != null) {
                predicates.add(cb.equal(root.get("enabled"), enabled));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<User> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(this::mapToResponse);
    }

    @Override
    public AdminUserResponse getUserById(UUID id) {
        User user = getUserAndCheckNotHardDeleted(id);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = getUserAndCheckNotHardDeleted(id);

        // Prevent modification of PENDING_DELETE users
        if (user.getAccountStatus() == AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("Cannot modify user in PENDING_DELETE status. Please restore first.");
        }

        if (StringUtils.hasText(request.getFirstName())) {
            user.setFirstName(request.getFirstName());
        }
        if (StringUtils.hasText(request.getLastName())) {
            user.setLastName(request.getLastName());
        }
        if (StringUtils.hasText(request.getPhone())) {
            user.setPhone(request.getPhone());
        }

        if (StringUtils.hasText(request.getEmail())) {
            // If email changed, check existence
            if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already exists");
            }
            user.setEmail(request.getEmail());
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(UUID id, UpdateUserRoleRequest request) {
        User user = getUserAndCheckNotHardDeleted(id);

        // Prevent modification of PENDING_DELETE users
        if (user.getAccountStatus() == AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("Cannot modify user in PENDING_DELETE status. Please restore first.");
        }

        String newRole = request.getRole();
        // Strict validation: Only CITIZEN or ENTERPRISE allowed
        if (!"CITIZEN".equals(newRole) && !"ENTERPRISE".equals(newRole)) {
            throw new BadRequestException("Role must be either CITIZEN or ENTERPRISE");
        }

        user.setRole(newRole);
        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(UUID id, UpdateUserStatusRequest request) {
        User user = getUserAndCheckNotHardDeleted(id);

        // Rule: admin cannot change status of another admin
        if ("ADMIN".equals(user.getRole())) {
            throw new BadRequestException("Cannot change status of an ADMIN account");
        }

        // Prevent direct status changes on PENDING_DELETE users
        if (user.getAccountStatus() == AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("Cannot modify user in PENDING_DELETE status. Please restore first.");
        }

        // Parse new status
        AccountStatus newStatus;
        try {
            newStatus = AccountStatus.valueOf(request.getAccountStatus());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid account status: " + request.getAccountStatus());
        }

        // Prevent setting status to PENDING_DELETE via this endpoint
        if (newStatus == AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("Cannot set PENDING_DELETE status. Use DELETE endpoint instead.");
        }

        // Update status
        user.setAccountStatus(newStatus);
        user.setEnabled(newStatus == AccountStatus.ACTIVE);

        // Handle ban reason - REQUIRE banReason when BANNED
        if (newStatus == AccountStatus.BANNED) {
            if (!StringUtils.hasText(request.getBanReason())) {
                throw new BadRequestException("Ban reason is required when banning a user");
            }
            user.setBanReason(request.getBanReason());
        } else {
            // Clear ban reason when not banned
            user.setBanReason(null);
        }

        User updatedUser = userRepository.save(user);
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        User user = getUserAndCheckNotHardDeleted(id);

        // Prevent deleting users already in PENDING_DELETE
        if (user.getAccountStatus() == AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("User is already pending deletion");
        }

        LocalDateTime now = LocalDateTime.now();
        user.setAccountStatus(AccountStatus.PENDING_DELETE);
        user.setDeletedAt(now);
        user.setDeleteScheduledAt(now.plusDays(14));
        user.setEnabled(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public AdminUserResponse restoreUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Only PENDING_DELETE users can be restored
        if (user.getAccountStatus() != AccountStatus.PENDING_DELETE) {
            throw new BadRequestException("User is not in PENDING_DELETE status");
        }

        // Check if restoration period has expired
        if (user.getDeleteScheduledAt() != null && user.getDeleteScheduledAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Restoration period has expired. User will be permanently deleted soon.");
        }

        // Restore user to ACTIVE status
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setEnabled(true);
        user.setDeletedAt(null);
        user.setDeleteScheduledAt(null);

        User restoredUser = userRepository.save(user);
        return mapToResponse(restoredUser);
    }

    private User getUserAndCheckNotHardDeleted(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        // Only check if user was hard deleted (ID doesn't exist)
        // Soft-deleted (PENDING_DELETE) users can still be viewed
        return user;
    }

    private AdminUserResponse mapToResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .userCode(user.getUserCode())
                .role(user.getRole())
                .accountStatus(user.getAccountStatus() != null ? user.getAccountStatus().name() : null)
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .deletedAt(user.getDeletedAt())
                .deleteScheduledAt(user.getDeleteScheduledAt())
                .banReason(user.getBanReason())
                .build();
    }
}
