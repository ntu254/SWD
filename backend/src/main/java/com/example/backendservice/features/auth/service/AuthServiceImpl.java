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
import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.CitizenRepository;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.security.jwt.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

        private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

        private final UserRepository userRepository;
        private final CitizenRepository citizenRepository;
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

        /**
         * Tạo profile tương ứng dựa trên role
         */
        private void createProfileBasedOnRole(User registeredUser, RoleType roleType) {
                switch (roleType) {
                        case CITIZEN -> {
                                Citizen citizen = Citizen.builder()
                                                .user(registeredUser)
                                                .currentPoints(0)
                                                .membershipTier("Bronze")
                                                .build();
                                citizenRepository.save(citizen);
                                // log.info("[PROFILE_CREATED] Created CitizenProfile for user: {}",
                                // registeredUser.getId());
                        }
                        case COLLECTOR -> {
                                CollectorProfile profile = CollectorProfile.builder()
                                                .user(registeredUser)
                                                .availabilityStatus("available")
                                                .build();
                                collectorProfileRepository.save(profile);
                                // log.info("[PROFILE_CREATED] Created CollectorProfile for user: {}",
                                // registeredUser.getId());
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
