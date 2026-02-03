package com.example.backendservice.features.user.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.dto.*;
import com.example.backendservice.features.user.entity.*;
import com.example.backendservice.features.user.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final CitizenProfileRepository citizenProfileRepository;
    private final CollectorProfileRepository collectorProfileRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        // Check email uniqueness
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .displayName(request.getDisplayName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .role(request.getRole())
                .accountStatus(AccountStatus.ACTIVE)
                .build();

        user = userRepository.save(user);
        log.info("Created user {} with role {}", user.getUserId(), user.getRole());

        // Create profile based on role
        if (request.getRole() == RoleType.CITIZEN) {
            createCitizenProfile(user);
        } else if (request.getRole() == RoleType.COLLECTOR) {
            createCollectorProfile(user);
        }

        return toUserResponse(user);
    }

    private void createCitizenProfile(User user) {
        CitizenProfile profile = CitizenProfile.builder()
                .user(user)
                .points(0)
                .build();
        citizenProfileRepository.save(profile);
        log.info("Created citizen profile for user {}", user.getUserId());
    }

    private void createCollectorProfile(User user) {
        CollectorProfile profile = CollectorProfile.builder()
                .user(user)
                .status("ACTIVE")
                .build();
        collectorProfileRepository.save(profile);
        log.info("Created collector profile for user {}", user.getUserId());
    }

    @Override
    public UserResponse getUserById(UUID userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return toUserResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);
        log.info("Updated user {}", userId);
        return toUserResponse(user);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        user.setAccountStatus(AccountStatus.PENDING_DELETE);
        userRepository.save(user);
        log.info("Soft deleted user {}", userId);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toUserResponse);
    }

    @Override
    public Page<UserResponse> getUsersByRole(RoleType role, Pageable pageable) {
        // findByRole returns List, need to convert to Page
        List<User> users = userRepository.findByRole(role);
        List<UserResponse> responses = users.stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), responses.size());
        List<UserResponse> pagedList = responses.subList(start, end);

        return new PageImpl<>(pagedList, pageable, responses.size());
    }

    @Override
    public CitizenProfileResponse getCitizenProfile(UUID userId) {
        CitizenProfile profile = citizenProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen profile not found for user: " + userId));
        return toCitizenProfileResponse(profile);
    }

    @Override
    @Transactional
    public CitizenProfileResponse updateCitizenProfile(UUID userId, UpdateCitizenProfileRequest request) {
        CitizenProfile profile = citizenProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Citizen profile not found for user: " + userId));

        User user = profile.getUser();

        if (request.getDefaultAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findByAreaId(request.getDefaultAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Service area not found: " + request.getDefaultAreaId()));
            profile.setDefaultArea(area);
        }
        if (request.getAddressText() != null) {
            profile.setAddressText(request.getAddressText());
        }
        if (request.getLatitude() != null) {
            profile.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            profile.setLongitude(request.getLongitude());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        profile = citizenProfileRepository.save(profile);
        log.info("Updated citizen profile for user {}", userId);

        return toCitizenProfileResponse(profile);
    }

    @Override
    public CollectorProfileResponse getCollectorProfile(UUID userId) {
        CollectorProfile profile = collectorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector profile not found for user: " + userId));
        return toCollectorProfileResponse(profile);
    }

    @Override
    @Transactional
    public CollectorProfileResponse updateCollectorProfile(UUID userId, UpdateCollectorProfileRequest request) {
        CollectorProfile profile = collectorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector profile not found for user: " + userId));

        User user = profile.getUser();

        if (request.getAssignedAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findByAreaId(request.getAssignedAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Service area not found: " + request.getAssignedAreaId()));
            profile.setDefaultArea(area);
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        profile = collectorProfileRepository.save(profile);
        log.info("Updated collector profile for user {}", userId);

        return toCollectorProfileResponse(profile);
    }

    @Override
    @Transactional
    public CollectorProfileResponse updateCollectorLocation(UUID userId, Double lat, Double lng) {
        CollectorProfile profile = collectorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector profile not found for user: " + userId));

        // Note: CollectorProfile entity doesn't have currentLat/currentLng fields
        // This is a placeholder - the entity would need to be updated to support this
        log.debug("Location update requested for collector {}: ({}, {})", userId, lat, lng);
        return toCollectorProfileResponse(profile);
    }

    @Override
    @Transactional
    public CollectorProfileResponse setCollectorAvailability(UUID userId, Boolean isAvailable) {
        CollectorProfile profile = collectorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Collector profile not found for user: " + userId));

        // Map availability to status
        profile.setStatus(isAvailable ? "ACTIVE" : "INACTIVE");
        profile = collectorProfileRepository.save(profile);

        log.info("Set availability for collector {} to {}", userId, isAvailable);
        return toCollectorProfileResponse(profile);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, String oldPassword, String newPassword) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("Password changed for user {}", userId);
    }

    @Override
    public void resetPassword(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // TODO: Implement password reset email logic
        log.info("Password reset requested for email {}", email);
    }

    // Mapping methods
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .userId(user.getUserId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .accountStatus(user.getAccountStatus())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private CitizenProfileResponse toCitizenProfileResponse(CitizenProfile profile) {
        User user = profile.getUser();
        return CitizenProfileResponse.builder()
                .userId(profile.getUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .phone(user != null ? user.getPhone() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .defaultAreaId(profile.getDefaultArea() != null ? profile.getDefaultArea().getAreaId() : null)
                .defaultAreaName(profile.getDefaultArea() != null ? profile.getDefaultArea().getName() : null)
                .addressText(profile.getAddressText())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .totalPoints(profile.getPoints())
                .createdAt(user != null ? user.getCreatedAt() : null)
                .updatedAt(user != null ? user.getUpdatedAt() : null)
                .build();
    }

    private CollectorProfileResponse toCollectorProfileResponse(CollectorProfile profile) {
        User user = profile.getUser();
        return CollectorProfileResponse.builder()
                .userId(profile.getUserId())
                .fullName(user != null ? user.getFullName() : null)
                .email(user != null ? user.getEmail() : null)
                .phone(user != null ? user.getPhone() : null)
                .avatarUrl(user != null ? user.getAvatarUrl() : null)
                .assignedAreaId(profile.getDefaultArea() != null ? profile.getDefaultArea().getAreaId() : null)
                .assignedAreaName(profile.getDefaultArea() != null ? profile.getDefaultArea().getName() : null)
                .isAvailable("ACTIVE".equals(profile.getStatus()))
                .status(profile.getStatus())
                .createdAt(user != null ? user.getCreatedAt() : null)
                .updatedAt(user != null ? user.getUpdatedAt() : null)
                .build();
    }
}
