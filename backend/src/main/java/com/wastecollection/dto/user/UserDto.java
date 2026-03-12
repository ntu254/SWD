package com.wastecollection.dto.user;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserDto {
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String phone;
    private String avatarUrl;
    private String role;
    private String accountStatus;
    private LocalDateTime createdAt;
}
