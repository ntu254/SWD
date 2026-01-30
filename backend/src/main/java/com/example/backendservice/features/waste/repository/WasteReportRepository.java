package com.example.backendservice.features.waste.repository;

import com.example.backendservice.features.waste.entity.WasteReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WasteReportRepository extends JpaRepository<WasteReport, UUID> {

    Page<WasteReport> findByCitizenId(UUID citizenId, Pageable pageable);

    Page<WasteReport> findByAreaId(UUID areaId, Pageable pageable);

    Page<WasteReport> findByStatus(String status, Pageable pageable);

    @Query("SELECT r FROM WasteReport r WHERE r.area.id = :areaId AND r.status = :status")
    Page<WasteReport> findByAreaIdAndStatus(
            @Param("areaId") UUID areaId,
            @Param("status") String status,
            Pageable pageable);

    List<WasteReport> findByStatusIn(List<String> statuses);

    @Query("SELECT COUNT(r) FROM WasteReport r WHERE r.citizen.id = :citizenId")
    long countByCitizenId(@Param("citizenId") UUID citizenId);
}
