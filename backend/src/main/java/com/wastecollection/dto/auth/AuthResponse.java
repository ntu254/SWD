package com.wastecollection.dto.auth;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private String role;
    private String avatarUrl;
}
