package com.example.backendservice.features.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backendservice.common.exception.BadRequestException;
import com.example.backendservice.features.auth.dto.AuthResponse;
import com.example.backendservice.features.auth.dto.LoginRequest;
import com.example.backendservice.features.auth.dto.RegisterRequest;
import com.example.backendservice.features.user.dto.UserResponse;
import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.security.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

        private final UserRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final AuthenticationManager authenticationManager;
        private final com.example.backendservice.common.service.EmailService emailService;

        @Override
        @Transactional
        public AuthResponse register(RegisterRequest request) {
                log.info("[AUTH_REGISTER] Registering new user: {}", request.getEmail());

                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new BadRequestException("Email is already registered");
                }

                // Determine role - default to CITIZEN
                String roleStr = request.getRole() != null ? request.getRole().toUpperCase() : "CITIZEN";
                RoleType roleType;
                try {
                        roleType = RoleType.valueOf(roleStr);
                } catch (IllegalArgumentException e) {
                        roleType = RoleType.CITIZEN;
                        roleStr = "CITIZEN";
                }

                User user;
                if (roleType == RoleType.CITIZEN) {
                        user = CitizenProfile.builder()
                                        .firstName(request.getFirstName())
                                        .lastName(request.getLastName())
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .role(roleStr)
                                        .phone(request.getPhone())
                                        .avatarUrl(request.getAvatarUrl())
                                        .enabled(true)
                                        .currentPoints(0)
                                        .membershipTier("Bronze")
                                        .build();
                } else if (roleType == RoleType.COLLECTOR) {
                        user = CollectorProfile.builder()
                                        .firstName(request.getFirstName())
                                        .lastName(request.getLastName())
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .role(roleStr)
                                        .phone(request.getPhone())
                                        .avatarUrl(request.getAvatarUrl())
                                        .enabled(true)
                                        .availabilityStatus("AVAILABLE")
                                        .build();
                } else if (roleType == RoleType.ENTERPRISE) {
                        user = Enterprise.builder()
                                        .firstName(request.getFirstName())
                                        .lastName(request.getLastName())
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .role(roleStr)
                                        .phone(request.getPhone())
                                        .avatarUrl(request.getAvatarUrl())
                                        .enabled(true)
                                        .name(request.getFirstName() + " " + request.getLastName()) // Default name
                                        .status("ACTIVE")
                                        .build();
                } else {
                        user = User.builder()
                                        .firstName(request.getFirstName())
                                        .lastName(request.getLastName())
                                        .email(request.getEmail())
                                        .password(passwordEncoder.encode(request.getPassword()))
                                        .role(roleStr)
                                        .phone(request.getPhone())
                                        .avatarUrl(request.getAvatarUrl())
                                        .enabled(true)
                                        .build();
                }

                // Add role to roles collection
                user.addRole(roleType);

                User savedUser = userRepository.save(user);
                log.info("[AUTH_REGISTERED] {} registered with id: {}", roleType, savedUser.getId());

                return generateTokensAndCreateResponse(savedUser);
        }

        @Override
        @Transactional
        public AuthResponse login(LoginRequest request) {
                log.info("[AUTH_LOGIN] Login attempt for: {}", request.getEmail());

                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new BadRequestException("User not found"));

                // Update lastLoginAt
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);

                return generateTokensAndCreateResponse(user);
        }

        private UserResponse mapToUserResponse(User user) {
                return UserResponse.builder()
                                .id(user.getId())
                                .firstName(user.getFirstName())
                                .lastName(user.getLastName())
                                .email(user.getEmail())
                                .role(user.getRole())
                                .phone(user.getPhone())
                                .avatarUrl(user.getAvatarUrl())
                                .enabled(user.isEnabled())
                                .createdAt(user.getCreatedAt())
                                .updatedAt(user.getUpdatedAt())
                                .build();
        }

        @Override
        @Transactional
        public void forgotPassword(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

                String otp = String.format("%06d", new java.util.Random().nextInt(999999));
                user.setOtpCode(otp);
                user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);

                emailService.sendOtpEmail(email, otp);
                log.info("[AUTH_FORGOT_PASS] OTP sent to: {}", email);
        }

        @Override
        @Transactional
        public AuthResponse resetPassword(String email, String otp, String newPassword) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadRequestException("User not found"));

                if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
                        throw new BadRequestException("Invalid OTP");
                }

                if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new BadRequestException("OTP has expired");
                }

                user.setPassword(passwordEncoder.encode(newPassword));
                user.setOtpCode(null);
                user.setOtpExpiry(null);

                // Clear old refresh token on password reset for security
                user.setRefreshToken(null);
                user.setRefreshTokenExpiry(null);

                User savedUser = userRepository.save(user);

                log.info("[AUTH_RESET_PASS] Password reset successfully for: {}", email);
                return generateTokensAndCreateResponse(savedUser);
        }

        @Override
        @Transactional
        public AuthResponse refreshToken(String refreshToken) {
                User user = userRepository.findByRefreshToken(refreshToken)
                                .orElseThrow(() -> new BadRequestException("Invalid or expired refresh token"));

                if (user.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
                        throw new BadRequestException("Refresh token has expired");
                }

                return generateTokensAndCreateResponse(user);
        }

        @Override
        @Transactional
        public void logout(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadRequestException("User not found"));

                user.setRefreshToken(null);
                user.setRefreshTokenExpiry(null);
                userRepository.save(user);
                log.info("[AUTH_LOGOUT] User logged out: {}", email);
        }

        private AuthResponse generateTokensAndCreateResponse(User user) {
                String accessToken = jwtTokenProvider.generateToken(user.getEmail());
                String refreshToken = java.util.UUID.randomUUID().toString();

                user.setRefreshToken(refreshToken);
                user.setRefreshTokenExpiry(LocalDateTime.now().plusDays(30)); // Refresh Token valid for 30 days
                user.setLastLoginAt(LocalDateTime.now());

                userRepository.save(user);

                return AuthResponse.builder()
                                .accessToken(accessToken)
                                .refreshToken(refreshToken)
                                .tokenType("Bearer")
                                .user(mapToUserResponse(user))
                                .build();
        }
}
