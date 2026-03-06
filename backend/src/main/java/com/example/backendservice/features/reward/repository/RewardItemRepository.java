package com.example.backendservice.features.reward.repository;

import com.example.backendservice.features.reward.entity.RewardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RewardItemRepository extends JpaRepository<RewardItem, UUID> {

    Optional<RewardItem> findByItemId(UUID itemId);

    @Query("SELECT r FROM RewardItem r WHERE r.isActive = true AND r.stock > 0 ORDER BY r.pointsCost ASC")
    List<RewardItem> findAvailableItems();

    @Query("SELECT r FROM RewardItem r WHERE r.isActive = true ORDER BY r.createdAt DESC")
    List<RewardItem> findAllActiveItems();
}
