package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.user.UpdateProfileRequest;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.entity.User;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.CitizenRepository;
import com.wastecollection.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final CloudinaryService cloudinaryService;

    public UserDto getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToDto(user);
    }

    @Transactional
    public UserDto updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getDisplayName() != null) user.setDisplayName(request.getDisplayName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        // Update citizen address if applicable
        if (request.getAddressText() != null && user.getRole() == User.Role.CITIZEN) {
            citizenRepository.findByUser_UserId(userId).ifPresent(citizen -> {
                citizen.setAddressText(request.getAddressText());
                citizenRepository.save(citizen);
            });
        }

        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto uploadAvatar(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        String url = cloudinaryService.uploadImage(file, "avatars");
        user.setAvatarUrl(url);
        return mapToDto(userRepository.save(user));
    }

    // ---- Admin operations ----

    public PageResponse<UserDto> listUsers(int page, int size, String role, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users;
        if (role != null) {
            users = userRepository.findByRole(User.Role.valueOf(role.toUpperCase()), pageable);
        } else if (status != null) {
            users = userRepository.findByAccountStatus(User.AccountStatus.valueOf(status.toUpperCase()), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return toPageResponse(users);
    }

    @Transactional
    public UserDto updateUserStatus(UUID userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        try {
            user.setAccountStatus(User.AccountStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid status: " + status);
        }
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public UserDto updateUserRole(UUID userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        try {
            user.setRole(User.Role.valueOf(role.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + role);
        }
        return mapToDto(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setAccountStatus(User.AccountStatus.PENDING_DELETE);
        userRepository.save(user);
    }

    public UserDto mapToDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().name())
                .accountStatus(user.getAccountStatus().name())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private PageResponse<UserDto> toPageResponse(Page<User> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }
}
