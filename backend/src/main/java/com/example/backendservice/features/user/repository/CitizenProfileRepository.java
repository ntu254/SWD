package com.example.backendservice.features.user.repository;

import com.example.backendservice.features.user.entity.CitizenProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CitizenProfileRepository extends JpaRepository<CitizenProfile, UUID> {
    // Current ID is the same as User ID due to Joined inheritance
}
