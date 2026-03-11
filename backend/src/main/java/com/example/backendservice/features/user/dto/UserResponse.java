package com.example.backendservice.features.user.dto;

import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID userId;
    private String firstName;
    private String lastName;
    private String displayName;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private AccountStatus accountStatus;
    private RoleType role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
