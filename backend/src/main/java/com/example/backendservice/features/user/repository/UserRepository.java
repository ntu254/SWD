package com.example.backendservice.features.user.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backendservice.features.user.entity.AccountStatus;
import com.example.backendservice.features.user.entity.User;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    Optional<User> findByRefreshToken(String refreshToken);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    /**
     * Find users by account status and deleteScheduledAt before given date
     * Used by scheduler to find expired pending delete users for hard deletion
     */
    List<User> findByAccountStatusAndDeleteScheduledAtBefore(AccountStatus status, LocalDateTime dateTime);
}
