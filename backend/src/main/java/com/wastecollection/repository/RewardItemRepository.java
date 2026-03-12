package com.wastecollection.repository;

import com.wastecollection.entity.RewardItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RewardItemRepository extends JpaRepository<RewardItem, UUID> {
    List<RewardItem> findByIsActiveTrueOrderByPointsCostAsc();
}
