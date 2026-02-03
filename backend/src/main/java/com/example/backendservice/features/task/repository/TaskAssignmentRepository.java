package com.example.backendservice.features.task.repository;

import com.example.backendservice.features.task.entity.TaskAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment, UUID> {

        Optional<TaskAssignment> findByAssignmentId(UUID assignmentId);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.task.taskId = :taskId")
        List<TaskAssignment> findByTaskId(@Param("taskId") UUID taskId);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.collectorUser.userId = :collectorUserId ORDER BY ta.acceptedAt DESC")
        List<TaskAssignment> findByCollectorUserId(@Param("collectorUserId") UUID collectorUserId);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.status = :status")
        List<TaskAssignment> findByStatus(@Param("status") String status);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.collectorUser.userId = :collectorUserId AND ta.status = :status")
        List<TaskAssignment> findByCollectorUserIdAndStatus(
                        @Param("collectorUserId") UUID collectorUserId,
                        @Param("status") String status);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.task.taskId = :taskId AND ta.status = 'ASSIGNED'")
        Optional<TaskAssignment> findActiveByTaskId(@Param("taskId") UUID taskId);

        @Query("SELECT COUNT(ta) FROM TaskAssignment ta WHERE ta.collectorUser.userId = :collectorUserId AND ta.status = :status")
        Long countByCollectorUserIdAndStatus(
                        @Param("collectorUserId") UUID collectorUserId,
                        @Param("status") String status);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.collectorUser.userId = :collectorUserId AND ta.unassignedAt IS NULL")
        List<TaskAssignment> findActiveAssignmentsByCollectorUserId(@Param("collectorUserId") UUID collectorUserId);

        @Query("SELECT ta FROM TaskAssignment ta WHERE ta.task.taskId = :taskId AND ta.collectorUser.userId = :collectorUserId")
        Optional<TaskAssignment> findByTaskIdAndCollectorUserId(
                        @Param("taskId") UUID taskId,
                        @Param("collectorUserId") UUID collectorUserId);
}
