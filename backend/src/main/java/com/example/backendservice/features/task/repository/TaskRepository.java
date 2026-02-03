package com.example.backendservice.features.task.repository;

import com.example.backendservice.features.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

        Optional<Task> findByTaskId(UUID taskId);

        @Query("SELECT t FROM Task t WHERE t.enterpriseUser.userId = :enterpriseUserId ORDER BY t.createdAt DESC")
        List<Task> findByEnterpriseUserId(@Param("enterpriseUserId") UUID enterpriseUserId);

        @Query("SELECT t FROM Task t WHERE t.createdByUser.userId = :createdByUserId ORDER BY t.createdAt DESC")
        List<Task> findByCreatedByUserId(@Param("createdByUserId") UUID createdByUserId);

        @Query("SELECT t FROM Task t WHERE t.area.areaId = :areaId ORDER BY t.createdAt DESC")
        List<Task> findByAreaId(@Param("areaId") UUID areaId);

        @Query("SELECT t FROM Task t WHERE t.wasteReport.reportId = :reportId")
        Optional<Task> findByReportId(@Param("reportId") UUID reportId);

        @Query("SELECT t FROM Task t WHERE t.status = :status ORDER BY t.priority DESC, t.createdAt ASC")
        List<Task> findByStatus(@Param("status") String status);

        @Query("SELECT t FROM Task t WHERE t.scheduledDate = :scheduledDate ORDER BY t.priority DESC")
        List<Task> findByScheduledDate(@Param("scheduledDate") LocalDate scheduledDate);

        @Query("SELECT t FROM Task t WHERE t.enterpriseUser.userId = :enterpriseUserId AND t.status = :status")
        List<Task> findByEnterpriseUserIdAndStatus(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("status") String status);

        @Query("SELECT t FROM Task t WHERE t.enterpriseUser.userId = :enterpriseUserId AND t.scheduledDate BETWEEN :startDate AND :endDate")
        List<Task> findByEnterpriseUserIdAndScheduledDateBetween(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT COUNT(t) FROM Task t WHERE t.enterpriseUser.userId = :enterpriseUserId AND t.status = :status")
        Long countByEnterpriseUserIdAndStatus(
                        @Param("enterpriseUserId") UUID enterpriseUserId,
                        @Param("status") String status);
}
