package com.example.backendservice.features.waste.repository;

import com.example.backendservice.features.waste.entity.WasteReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WasteReportRepository extends JpaRepository<WasteReport, UUID> {

    Optional<WasteReport> findByReportId(UUID reportId);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.reporterUser.userId = :reporterUserId ORDER BY wr.createdAt DESC")
    List<WasteReport> findByReporterUserId(@Param("reporterUserId") UUID reporterUserId);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.area.areaId = :areaId ORDER BY wr.createdAt DESC")
    List<WasteReport> findByAreaId(@Param("areaId") UUID areaId);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.status = :status ORDER BY wr.createdAt DESC")
    List<WasteReport> findByStatus(@Param("status") String status);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.wasteType.wasteTypeId = :wasteTypeId ORDER BY wr.createdAt DESC")
    List<WasteReport> findByWasteTypeId(@Param("wasteTypeId") UUID wasteTypeId);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.createdAt >= :since ORDER BY wr.createdAt DESC")
    List<WasteReport> findRecentReports(@Param("since") LocalDateTime since);

    @Query("SELECT wr FROM WasteReport wr WHERE wr.area.areaId = :areaId AND wr.status = 'PENDING' ORDER BY wr.createdAt ASC")
    List<WasteReport> findPendingByAreaId(@Param("areaId") UUID areaId);

    @Query("SELECT COUNT(wr) FROM WasteReport wr WHERE wr.reporterUser.userId = :reporterUserId")
    Long countByReporterUserId(@Param("reporterUserId") UUID reporterUserId);
}
