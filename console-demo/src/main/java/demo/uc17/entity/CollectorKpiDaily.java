package demo.uc17.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UC-17 Entity: CollectorKpiDaily
 * Daily KPI record for a collector - configured by Enterprise.
 * Pattern: Template Method - isKpiMet() encapsulates the KPI check logic
 */
public class CollectorKpiDaily {

    private UUID kpiId;
    private UUID collectorUserId;
    private String collectorName;
    private String areaName;
    private LocalDate kpiDate;

    // KPI Targets (set by Enterprise)
    private double minWeightKg;
    private int minVisits;

    // Actuals (updated by system after each visit)
    private double actualWeightKg;
    private int actualVisits;

    private CollectorKpiStatus status;
    private LocalDateTime updatedAt;

    public CollectorKpiDaily(UUID collectorUserId, String collectorName,
            String areaName, LocalDate kpiDate) {
        this.kpiId = UUID.randomUUID();
        this.collectorUserId = collectorUserId;
        this.collectorName = collectorName;
        this.areaName = areaName;
        this.kpiDate = kpiDate;
        this.minWeightKg = 50.0;
        this.minVisits = 5;
        this.actualWeightKg = 0.0;
        this.actualVisits = 0;
        this.status = CollectorKpiStatus.PENDING;
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Template Method Pattern:
     * KPI check logic encapsulated in entity - reused everywhere.
     */
    public boolean isKpiMet() {
        return actualWeightKg >= minWeightKg && actualVisits >= minVisits;
    }

    /**
     * Update KPI after each collection visit.
     */
    public void incrementVisit(double weightKg) {
        this.actualVisits++;
        this.actualWeightKg += weightKg;
        this.updatedAt = LocalDateTime.now();
        if (isKpiMet())
            this.status = CollectorKpiStatus.MET;
    }

    public void finalize() {
        if (this.status == CollectorKpiStatus.PENDING) {
            this.status = isKpiMet() ? CollectorKpiStatus.MET : CollectorKpiStatus.NOT_MET;
        }
        this.updatedAt = LocalDateTime.now();
    }

    public void setTargets(double minWeightKg, int minVisits) {
        this.minWeightKg = minWeightKg;
        this.minVisits = minVisits;
        this.updatedAt = LocalDateTime.now();
    }

    /** Called by KpiService when factory evaluator decides the final status. */
    public void setFinalStatus(CollectorKpiStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
    }

    public double getWeightProgress() {
        return minWeightKg > 0 ? (actualWeightKg / minWeightKg) * 100 : 0;
    }

    public double getVisitsProgress() {
        return minVisits > 0 ? ((double) actualVisits / minVisits) * 100 : 0;
    }

    public UUID getKpiId() {
        return kpiId;
    }

    public UUID getCollectorUserId() {
        return collectorUserId;
    }

    public String getCollectorName() {
        return collectorName;
    }

    public String getAreaName() {
        return areaName;
    }

    public LocalDate getKpiDate() {
        return kpiDate;
    }

    public double getMinWeightKg() {
        return minWeightKg;
    }

    public int getMinVisits() {
        return minVisits;
    }

    public double getActualWeightKg() {
        return actualWeightKg;
    }

    public int getActualVisits() {
        return actualVisits;
    }

    public CollectorKpiStatus getStatus() {
        return status;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
