package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.Citizen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CitizenRepository extends JpaRepository<Citizen, UUID> {

    Optional<Citizen> findByUser_Id(UUID userId);

    boolean existsByUser_Id(UUID userId);
}
