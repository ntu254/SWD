package com.example.backendservice.features.analytics.repository;

import com.example.backendservice.features.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for analytics queries
 * Provides aggregation queries for enterprise analytics dashboard
 */
@Repository
public interface AnalyticsRepository extends JpaRepository<Task, UUID> {

    // ===================== TASK COUNTS =====================

    @Query("SELECT COUNT(t) FROM Task t WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND t.createdAt >= :startDateTime AND t.createdAt < :endDateTime")
    Long countTotalTasks(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND t.status = :status " +
            "AND t.createdAt >= :startDateTime AND t.createdAt < :endDateTime")
    Long countTasksByStatus(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("status") String status,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== WEIGHT AGGREGATION =====================

    @Query("SELECT COALESCE(SUM(vwi.weightKg), 0) FROM VisitWasteItem vwi " +
            "JOIN vwi.visit cv " +
            "JOIN cv.task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND cv.visitedAt >= :startDateTime AND cv.visitedAt < :endDateTime " +
            "AND cv.visitStatus = 'VISITED'")
    Double sumTotalWeightCollected(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== COLLECTORS =====================

    @Query("SELECT COUNT(DISTINCT ta.collectorUser.userId) FROM TaskAssignment ta " +
            "JOIN ta.task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND ta.assignedAt >= :startDateTime AND ta.assignedAt < :endDateTime")
    Long countActiveCollectors(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== POINTS =====================

    @Query("SELECT COALESCE(SUM(rt.pointsDelta), 0) FROM RewardTransaction rt " +
            "JOIN rt.visit cv " +
            "JOIN cv.task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND rt.createdAt >= :startDateTime AND rt.createdAt < :endDateTime " +
            "AND rt.reasonCode = 'COLLECTION'")
    Integer sumPointsAwarded(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== WASTE TYPE BREAKDOWN =====================

    @Query("SELECT vwi.wasteType.wasteTypeId, vwi.wasteType.name, " +
            "COUNT(DISTINCT t.taskId), COALESCE(SUM(vwi.weightKg), 0) " +
            "FROM VisitWasteItem vwi " +
            "JOIN vwi.visit cv " +
            "JOIN cv.task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND cv.visitedAt >= :startDateTime AND cv.visitedAt < :endDateTime " +
            "AND cv.visitStatus = 'VISITED' " +
            "GROUP BY vwi.wasteType.wasteTypeId, vwi.wasteType.name")
    List<Object[]> getWasteTypeBreakdown(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== AREA BREAKDOWN =====================

    @Query("SELECT t.area.areaId, t.area.name, " +
            "COUNT(t.taskId), " +
            "SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), " +
            "COUNT(DISTINCT ta.collectorUser.userId) " +
            "FROM Task t " +
            "LEFT JOIN TaskAssignment ta ON ta.task.taskId = t.taskId " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND t.createdAt >= :startDateTime AND t.createdAt < :endDateTime " +
            "AND t.area IS NOT NULL " +
            "GROUP BY t.area.areaId, t.area.name")
    List<Object[]> getAreaBreakdown(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== DAILY STATS =====================

    @Query("SELECT CAST(t.createdAt AS LocalDate), " +
            "COUNT(t.taskId), " +
            "SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) " +
            "FROM Task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND t.createdAt >= :startDateTime AND t.createdAt < :endDateTime " +
            "GROUP BY CAST(t.createdAt AS LocalDate) " +
            "ORDER BY CAST(t.createdAt AS LocalDate)")
    List<Object[]> getDailyTaskStats(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT CAST(cv.visitedAt AS LocalDate), COALESCE(SUM(vwi.weightKg), 0) " +
            "FROM VisitWasteItem vwi " +
            "JOIN vwi.visit cv " +
            "JOIN cv.task t " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND cv.visitedAt >= :startDateTime AND cv.visitedAt < :endDateTime " +
            "AND cv.visitStatus = 'VISITED' " +
            "GROUP BY CAST(cv.visitedAt AS LocalDate) " +
            "ORDER BY CAST(cv.visitedAt AS LocalDate)")
    List<Object[]> getDailyWeightStats(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    // ===================== WASTE REPORT COUNTS =====================

    @Query("SELECT COUNT(wr) FROM WasteReport wr " +
            "JOIN Task t ON t.wasteReport.reportId = wr.reportId " +
            "WHERE t.enterpriseUser.userId = :enterpriseId " +
            "AND wr.createdAt >= :startDateTime AND wr.createdAt < :endDateTime")
    Long countReportsReceived(
            @Param("enterpriseId") UUID enterpriseId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);
}
