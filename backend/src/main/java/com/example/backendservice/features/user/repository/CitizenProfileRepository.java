package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, UUID> {

    /**
     * Tìm CitizenProfile theo User ID (sử dụng nested property syntax)
     */
    Optional<CitizenProfile> findByUser_Id(UUID userId);

    /**
     * Kiểm tra CitizenProfile tồn tại theo User ID
     */
    boolean existsByUser_Id(UUID userId);

    /**
     * Tìm CitizenProfile theo User email
     */
    Optional<CitizenProfile> findByUser_Email(String email);
}
