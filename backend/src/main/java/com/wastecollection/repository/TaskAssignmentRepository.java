package com.wastecollection.repository;

import com.wastecollection.entity.TaskAssignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {
    Page<TaskAssignment> findByCollector_UserId(UUID collectorId, Pageable pageable);

    Page<TaskAssignment> findByCollector_UserIdAndStatusIn(UUID collectorId, List<String> statuses, Pageable pageable);

    List<TaskAssignment> findByCollector_UserIdAndStatusIn(UUID collectorId, List<String> statuses);

    List<TaskAssignment> findAllByTask_TaskIdAndStatusIn(UUID taskId, List<String> statuses);

    Optional<TaskAssignment> findByTask_TaskIdAndStatusIn(UUID taskId, List<String> statuses);

    Optional<TaskAssignment> findByTask_TaskIdAndCollector_UserIdAndStatusIn(UUID taskId, UUID collectorId, List<String> statuses);

    Optional<TaskAssignment> findTopByTask_TaskIdOrderByAssignedAtDesc(UUID taskId);

    long countByCollector_UserIdAndStatus(UUID collectorId, String status);
}
