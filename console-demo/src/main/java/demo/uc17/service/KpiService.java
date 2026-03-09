package demo.uc17.service;

import demo.uc17.entity.CollectorKpiDaily;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * UC-17 Service Interface
 * Pattern: Strategy (extracted so Decorator can wrap it)
 */
public interface KpiService {
    CollectorKpiDaily setKpiTargets(UUID collectorUserId, String collectorName,
            String areaName, LocalDate kpiDate,
            double minWeightKg, int minVisits);

    void updateKpiAfterVisit(UUID collectorUserId, String collectorName,
            String areaName, LocalDate date, double weightKg);

    void finalizeKpisForDate(LocalDate date);

    CollectorKpiDaily getKpi(UUID collectorUserId, String areaName, LocalDate date);

    List<CollectorKpiDaily> getAllKpis();

    List<CollectorKpiDaily> getKpisByCollector(UUID collectorUserId);

    List<CollectorKpiDaily> getKpisByDate(LocalDate date);
}
