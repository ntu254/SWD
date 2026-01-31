package com.example.backendservice.features.auth.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backendservice.common.exception.BadRequestException;
import com.example.backendservice.features.auth.dto.AuthResponse;
import com.example.backendservice.features.auth.dto.LoginRequest;
import com.example.backendservice.features.auth.dto.RegisterRequest;
import com.example.backendservice.features.user.dto.UserResponse;
import com.example.backendservice.features.user.entity.CitizenProfile;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenProfileRepository;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
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
        private final CitizenProfileRepository citizenProfileRepository;
        private final CollectorProfileRepository collectorProfileRepository;
        private final PasswordEncoder passwordEncoder;
        private final JwtTokenProvider jwtTokenProvider;
        private final AuthenticationManager authenticationManager;

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

                User user = User.builder()
                                .firstName(request.getFirstName())
                                .lastName(request.getLastName())
                                .email(request.getEmail())
                                .password(passwordEncoder.encode(request.getPassword()))
                                .role(roleStr) // Legacy field
                                .phone(request.getPhone())
                                .avatarUrl(request.getAvatarUrl())
                                .enabled(true)
                                .build();

                // Add role to roles collection
                user.addRole(roleType);

                User savedUser = userRepository.save(user);
                log.info("[AUTH_REGISTERED] User registered with id: {}, role: {}", savedUser.getId(), roleType);

                // Create profile based on role
                createProfileBasedOnRole(savedUser, roleType);

                String token = jwtTokenProvider.generateToken(savedUser.getEmail());

                return AuthResponse.builder()
                                .accessToken(token)
                                .tokenType("Bearer")
                                .user(mapToUserResponse(savedUser))
                                .build();
        }

        @Override
        @Transactional
        public AuthResponse login(LoginRequest request) {
                log.info("[AUTH_LOGIN] Login attempt for: {}", request.getEmail());

                Authentication authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                String token = jwtTokenProvider.generateToken(authentication);

                User user = userRepository.findByEmail(request.getEmail())
                                .orElseThrow(() -> new BadRequestException("User not found"));

                // Update lastLoginAt
                user.setLastLoginAt(LocalDateTime.now());
                userRepository.save(user);
                log.info("[AUTH_LOGGED_IN] User logged in: id={}, lastLoginAt={}", user.getId(), user.getLastLoginAt());

                return AuthResponse.builder()
                                .accessToken(token)
                                .tokenType("Bearer")
                                .user(mapToUserResponse(user))
                                .build();
        }

        private final com.example.backendservice.common.service.EmailService emailService;

        @Override
        @Transactional
        public void forgotPassword(String email) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadRequestException("User not found with email: " + email));

                // Generate 6 digit OTP
                String otp = String.format("%06d", new java.util.Random().nextInt(999999));
                
                user.setOtpCode(otp);
                user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
                userRepository.save(user);

                // Send email
                emailService.sendOtpEmail(email, otp);
                log.info("[AUTH_FORGOT_PASS] OTP sent to: {}", email);
        }

        @Override
        @Transactional
        public AuthResponse resetPassword(String email, String otp, String newPassword) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new BadRequestException("User not found"));

                // Validate OTP
                if (user.getOtpCode() == null || !user.getOtpCode().equals(otp)) {
                        throw new BadRequestException("Invalid OTP");
                }

                if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
                        throw new BadRequestException("OTP has expired");
                }

                // Reset password
                user.setPassword(passwordEncoder.encode(newPassword));
                user.setOtpCode(null);
                user.setOtpExpiry(null);
                userRepository.save(user);

                log.info("[AUTH_RESET_PASS] Password reset successfully for: {}", email);

                // Auto login after reset
                String token = jwtTokenProvider.generateToken(user.getEmail());
                return AuthResponse.builder()
                                .accessToken(token)
                                .tokenType("Bearer")
                                .user(mapToUserResponse(user))
                                .build();
        }

        /**
         * Tạo profile tương ứng dựa trên role
         */
        private void createProfileBasedOnRole(User user, RoleType roleType) {
                switch (roleType) {
                        case CITIZEN -> {
                                CitizenProfile citizen = CitizenProfile.builder()
                                                .user(user)
                                                .currentPoints(0)
                                                .membershipTier("Bronze")
                                                .build();
                                citizenProfileRepository.save(citizen);
                                log.info("[PROFILE_CREATED] Created CitizenProfile for user: {}", user.getId());
                        }
                        case COLLECTOR -> {
                                CollectorProfile profile = CollectorProfile.builder()
                                                .user(user)
                                                .availabilityStatus("available")
                                                .build();
                                collectorProfileRepository.save(profile);
                                log.info("[PROFILE_CREATED] Created CollectorProfile for user: {}", user.getId());
                        }
                        case ADMIN, ENTERPRISE -> {
                                // Admin và Enterprise không cần profile riêng
                                log.info("[PROFILE_SKIPPED] No additional profile for role: {}", roleType);
                        }
                }
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
}
