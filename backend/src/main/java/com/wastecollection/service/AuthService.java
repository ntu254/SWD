package com.wastecollection.service;

import com.wastecollection.dto.auth.*;
import com.wastecollection.dto.user.UserDto;
import com.wastecollection.entity.Citizen;
import com.wastecollection.entity.Collector;
import com.wastecollection.entity.User;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.CitizenRepository;
import com.wastecollection.repository.CollectorRepository;
import com.wastecollection.repository.UserRepository;
import com.wastecollection.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CitizenRepository citizenRepository;
    private final CollectorRepository collectorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Value("${admin.setup.secret:swd392-setup-secret}")
    private String adminSetupSecret;

    @Transactional
    public AuthResponse setupAdmin(RegisterRequest request, String secret) {
        if (!adminSetupSecret.equals(secret)) {
            throw new BadRequestException("Invalid setup secret");
        }
        // If admin already exists, update the password and return the token
        User existing = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ADMIN)
                .findFirst().orElse(null);
        if (existing != null) {
            existing.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            existing = userRepository.saveAndFlush(existing);
            return generateAuthResponse(existing);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        User user = User.builder()
                .userId(UUID.randomUUID())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .displayName(request.getDisplayName() != null
                        ? request.getDisplayName()
                        : request.getFirstName() + " " + request.getLastName())
                .phone(request.getPhone())
                .role(User.Role.ADMIN)
                .accountStatus(User.AccountStatus.ACTIVE)
                .build();
        user = userRepository.saveAndFlush(user);
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role: " + request.getRole());
        }
        if (role == User.Role.ADMIN) {
            throw new BadRequestException("Cannot self-register as ADMIN");
        }

        User user = User.builder()
                .userId(UUID.randomUUID())          // explicit UUID → no null-id issue
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .displayName(request.getDisplayName() != null
                        ? request.getDisplayName()
                        : request.getFirstName() + " " + request.getLastName())
                .phone(request.getPhone())
                .role(role)
                .accountStatus(User.AccountStatus.ACTIVE)
                .build();

        user = userRepository.saveAndFlush(user);   // flush immediately → ID guaranteed

        // Create role-specific profile
        if (role == User.Role.CITIZEN) {
            Citizen citizen = new Citizen();         // avoid @MapsId + Lombok builder conflict
            citizen.setUser(user);
            citizen.setPoints(0);
            citizenRepository.saveAndFlush(citizen);
        } else if (role == User.Role.COLLECTOR) {
            if (request.getEnterpriseUserId() == null) {
                throw new BadRequestException("Enterprise user ID is required for COLLECTOR role");
            }
            UUID enterpriseId = UUID.fromString(request.getEnterpriseUserId());
            User enterprise = userRepository.findById(enterpriseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Enterprise", "userId", enterpriseId));
            if (enterprise.getRole() != User.Role.ENTERPRISE) {
                throw new BadRequestException("Specified user is not an ENTERPRISE");
            }
            Collector collector = new Collector();
            collector.setUser(user);
            collector.setEnterprise(enterprise);
            collector.setStatus("ACTIVE");
            collectorRepository.saveAndFlush(collector);
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", request.getEmail()));

        if (user.getAccountStatus() != User.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is " + user.getAccountStatus().name().toLowerCase());
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }

        String userId = tokenProvider.getUserIdFromToken(refreshToken);
        User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!refreshToken.equals(user.getRefreshToken()) ||
                user.getRefreshTokenExpiry() == null ||
                user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token is expired or revoked");
        }

        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setRefreshToken(null);
            user.setRefreshTokenExpiry(null);
            userRepository.save(user);
        });
    }

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        user.setRefreshToken(refreshToken);
        user.setRefreshTokenExpiry(
                LocalDateTime.now().plusSeconds(tokenProvider.getRefreshTokenExpirationMs() / 1000));
        userRepository.save(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .displayName(user.getDisplayName())
                .role(user.getRole().name())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}
