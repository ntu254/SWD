package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {

    List<UserRole> findByUserId(UUID userId);

    List<UserRole> findByRole(RoleType role);

    boolean existsByUserIdAndRole(UUID userId, RoleType role);

    void deleteByUserIdAndRole(UUID userId, RoleType role);
}
