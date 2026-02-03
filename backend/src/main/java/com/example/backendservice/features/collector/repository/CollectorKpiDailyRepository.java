package com.example.backendservice.features.collector.repository;

import com.example.backendservice.features.collector.entity.CollectorKpiDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorKpiDailyRepository extends JpaRepository<CollectorKpiDaily, UUID> {

    Optional<CollectorKpiDaily> findByKpiId(UUID kpiId);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId ORDER BY ckd.kpiDate DESC")
    List<CollectorKpiDaily> findByCollectorUserId(@Param("collectorUserId") UUID collectorUserId);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId AND ckd.kpiDate = :kpiDate")
    Optional<CollectorKpiDaily> findByCollectorUserIdAndKpiDate(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("kpiDate") LocalDate kpiDate);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId AND ckd.area.areaId = :areaId AND ckd.kpiDate = :kpiDate")
    Optional<CollectorKpiDaily> findByCollectorUserIdAndAreaIdAndKpiDate(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("areaId") UUID areaId,
            @Param("kpiDate") LocalDate kpiDate);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.kpiDate = :kpiDate ORDER BY ckd.actualWeightKg DESC")
    List<CollectorKpiDaily> findByKpiDate(@Param("kpiDate") LocalDate kpiDate);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId AND ckd.kpiDate BETWEEN :startDate AND :endDate ORDER BY ckd.kpiDate ASC")
    List<CollectorKpiDaily> findByCollectorUserIdAndKpiDateBetween(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.status = :status AND ckd.kpiDate = :kpiDate")
    List<CollectorKpiDaily> findByStatusAndKpiDate(
            @Param("status") String status,
            @Param("kpiDate") LocalDate kpiDate);

    @Query("SELECT ckd FROM CollectorKpiDaily ckd WHERE ckd.area.areaId = :areaId AND ckd.kpiDate = :kpiDate")
    List<CollectorKpiDaily> findByAreaIdAndKpiDate(
            @Param("areaId") UUID areaId,
            @Param("kpiDate") LocalDate kpiDate);

    @Query("SELECT SUM(ckd.actualWeightKg) FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId AND ckd.kpiDate BETWEEN :startDate AND :endDate")
    Double sumActualWeightByCollectorUserIdAndDateRange(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT SUM(ckd.actualVisits) FROM CollectorKpiDaily ckd WHERE ckd.collectorUser.userId = :collectorUserId AND ckd.kpiDate BETWEEN :startDate AND :endDate")
    Integer sumActualVisitsByCollectorUserIdAndDateRange(
            @Param("collectorUserId") UUID collectorUserId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
