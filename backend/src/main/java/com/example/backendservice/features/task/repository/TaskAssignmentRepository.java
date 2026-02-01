package com.example.backendservice.features.task.repository;

import com.example.backendservice.features.task.entity.TaskAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {

    List<TaskAssignment> findByTaskId(UUID taskId);

    Page<TaskAssignment> findByCollectorId(UUID collectorId, Pageable pageable);

    @Query("SELECT ta FROM TaskAssignment ta WHERE ta.collector.id = :collectorId AND ta.status = :status")
    Page<TaskAssignment> findByCollectorIdAndStatus(
            @Param("collectorId") UUID collectorId,
            @Param("status") String status,
            Pageable pageable);

    Optional<TaskAssignment> findByTaskIdAndCollectorId(UUID taskId, UUID collectorId);

    @Query("SELECT COUNT(ta) FROM TaskAssignment ta WHERE ta.collector.id = :collectorId AND ta.status IN :statuses")
    long countActiveAssignments(
            @Param("collectorId") UUID collectorId,
            @Param("statuses") List<String> statuses);
}
