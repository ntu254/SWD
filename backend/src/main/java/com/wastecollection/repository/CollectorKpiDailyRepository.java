package com.wastecollection.repository;

import com.wastecollection.entity.CollectorKpiDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CollectorKpiDailyRepository extends JpaRepository<CollectorKpiDaily, UUID> {
    Optional<CollectorKpiDaily> findByCollector_UserIdAndKpiDate(UUID collectorId, LocalDate date);
    java.util.List<CollectorKpiDaily> findByCollector_UserIdOrderByKpiDateDesc(UUID collectorId);
}
