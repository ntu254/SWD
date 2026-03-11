package com.example.backendservice.security.authorization;

import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("userAccessEvaluator")
@RequiredArgsConstructor
public class UserAccessEvaluator {

    private final UserRepository userRepository;

    public boolean isCurrentUser(UUID userId, Authentication authentication) {
        if (userId == null || authentication == null || authentication.getName() == null) {
            return false;
        }

        return userRepository.findByUserId(userId)
                .map(user -> user.getEmail().equalsIgnoreCase(authentication.getName()))
                .orElse(false);
    }
}
