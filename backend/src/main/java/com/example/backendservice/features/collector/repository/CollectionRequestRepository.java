package com.example.backendservice.features.collector.repository;

import com.example.backendservice.features.collector.entity.CollectionRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface CollectionRequestRepository extends JpaRepository<CollectionRequest, UUID> {

        /**
         * Find tasks assigned to a collector with specific statuses
         */
        Page<CollectionRequest> findByCollectorIdAndStatusIn(
                        UUID collectorId,
                        List<String> statuses,
                        Pageable pageable);

        /**
         * Find completed/failed/cancelled jobs for history
         */
        Page<CollectionRequest> findByCollectorIdAndStatusInAndCreatedAtBetween(
                        UUID collectorId,
                        List<String> statuses,
                        Instant from,
                        Instant to,
                        Pageable pageable);

        /**
         * Count total jobs assigned to collector
         */
        long countByCollectorId(UUID collectorId);

        /**
         * Count jobs by collector and status
         */
        long countByCollectorIdAndStatus(UUID collectorId, String status);

        /**
         * Calculate average completion time (assignedAt to collectedAt) in seconds
         * Using native SQL for PostgreSQL-specific EXTRACT function
         */
        @Query(value = """
                        SELECT AVG(EXTRACT(EPOCH FROM (collected_at - assigned_at)))
                        FROM collection_requests
                        WHERE collector_id = :collectorId
                        AND status = 'COLLECTED'
                        AND assigned_at IS NOT NULL
                        AND collected_at IS NOT NULL
                        """, nativeQuery = true)
        Double calculateAverageCompletionTimeSeconds(@Param("collectorId") UUID collectorId);
}
