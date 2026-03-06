package com.example.backendservice.security.service;

import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

/**
 * Custom UserDetailsService implementation for Spring Security
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                user.getAccountStatus() == com.example.backendservice.features.user.entity.AccountStatus.ACTIVE,
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }
}
