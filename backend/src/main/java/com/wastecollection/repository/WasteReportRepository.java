package com.wastecollection.repository;

import com.wastecollection.entity.WasteReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WasteReportRepository extends JpaRepository<WasteReport, UUID> {
    Page<WasteReport> findByReporter_UserId(UUID userId, Pageable pageable);

    Page<WasteReport> findByStatus(String status, Pageable pageable);

    Page<WasteReport> findByArea_AreaId(UUID areaId, Pageable pageable);

    @Query("SELECT r FROM WasteReport r WHERE r.area.areaId IN :areaIds AND r.status = 'PENDING'")
    Page<WasteReport> findPendingInAreas(List<UUID> areaIds, Pageable pageable);

    @Query("SELECT COUNT(r) FROM WasteReport r WHERE r.status = :status")
    long countByStatus(String status);
}
