package com.example.backendservice.features.collector.repository;

import com.example.backendservice.features.collector.entity.CollectorLocationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorLocationLogRepository extends JpaRepository<CollectorLocationLog, UUID> {

    /**
     * Find location logs for a collector ordered by recorded time
     */
    Page<CollectorLocationLog> findByCollectorIdOrderByRecordedAtDesc(
            UUID collectorId,
            Pageable pageable);

    /**
     * Find the most recent location for a collector
     */
    Optional<CollectorLocationLog> findFirstByCollectorIdOrderByRecordedAtDesc(UUID collectorId);
}
