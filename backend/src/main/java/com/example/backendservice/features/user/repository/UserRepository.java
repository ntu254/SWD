package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByUserId(UUID userId);

    List<User> findByRole(RoleType role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.deletedAt IS NULL")
    List<User> findActiveByRole(@Param("role") RoleType role);

    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findAllActive();

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.deletedAt IS NULL")
    Optional<User> findActiveByEmail(@Param("email") String email);

    List<User> findByDisplayNameContainingIgnoreCase(String displayName);

    @Query("SELECT u FROM User u WHERE u.role = 'ENTERPRISE' AND u.deletedAt IS NULL")
    List<User> findAllActiveEnterprises();

    @Query("SELECT u FROM User u WHERE u.role = 'COLLECTOR' AND u.deletedAt IS NULL")
    List<User> findAllActiveCollectors();

    @Query("SELECT u FROM User u WHERE u.role = 'CITIZEN' AND u.deletedAt IS NULL")
    List<User> findAllActiveCitizens();

    Optional<User> findByRefreshToken(String refreshToken);
}
