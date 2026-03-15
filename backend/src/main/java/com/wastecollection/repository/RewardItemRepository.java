package com.wastecollection.repository;

import com.wastecollection.entity.RewardItem;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RewardItemRepository extends JpaRepository<RewardItem, UUID> {
    List<RewardItem> findByIsActiveTrueAndPointsCostGreaterThanAndStockGreaterThanOrderByPointsCostAsc(
            Integer pointsCost,
            Integer stock
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ri FROM RewardItem ri WHERE ri.itemId = :itemId")
    Optional<RewardItem> findByIdForUpdate(UUID itemId);
}
