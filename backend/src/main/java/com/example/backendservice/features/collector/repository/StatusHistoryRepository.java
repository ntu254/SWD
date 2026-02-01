package com.example.backendservice.features.collector.repository;

import com.example.backendservice.features.collector.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, UUID> {

    /**
     * Find all status history for a specific target
     */
    List<StatusHistory> findByTargetTypeAndTargetIdOrderByTimestampDesc(
            String targetType,
            UUID targetId);

    /**
     * Find status history by target
     */
    List<StatusHistory> findByTargetTypeAndTargetId(String targetType, UUID targetId);
}
