package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.RewardItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RewardItemRepository extends JpaRepository<RewardItem, UUID> {

    Page<RewardItem> findByStatus(String status, Pageable pageable);

    Page<RewardItem> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<RewardItem> findByStatusAndNameContainingIgnoreCase(String status, String name, Pageable pageable);
}
