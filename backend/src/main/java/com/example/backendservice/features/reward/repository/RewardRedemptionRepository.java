package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.RewardRedemption;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RewardRedemptionRepository extends JpaRepository<RewardRedemption, UUID> {

    Page<RewardRedemption> findByStatus(String status, Pageable pageable);

    Page<RewardRedemption> findByCitizenId(UUID citizenId, Pageable pageable);

    Page<RewardRedemption> findByStatusAndCitizenId(String status, UUID citizenId, Pageable pageable);
}
