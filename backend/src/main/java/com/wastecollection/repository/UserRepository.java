package com.wastecollection.repository;

import com.wastecollection.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRole(User.Role role);
    Page<User> findByRole(User.Role role, Pageable pageable);
    Page<User> findByAccountStatus(User.AccountStatus status, Pageable pageable);
}
