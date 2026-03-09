package demo.uc17.service;

import demo.uc17.config.*;
import demo.uc17.entity.CollectorKpiDaily;
import demo.uc17.entity.CollectorKpiStatus;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * UC-17 Service
 * Implements KpiService interface (enables Decorator pattern).
 * Patterns: Repository (in-memory), Observer (updateKpiAfterVisit),
 * Abstract Factory (KpiConfigFactory -> BonusCalculator + KpiEvaluator)
 */
public class CollectorKpiService implements KpiService {

    private final Map<String, CollectorKpiDaily> store = new LinkedHashMap<>();
    private final BonusCalculator bonusCalculator; // Abstract Factory Product A
    private final KpiEvaluator kpiEvaluator; // Abstract Factory Product B
    private final List<String> bonusLog = new ArrayList<>();

    /** Default constructor: StandardKpiConfigFactory. */
    public CollectorKpiService() {
        this(new StandardKpiConfigFactory());
    }

    /** Parameterized constructor: Abstract Factory injects products. */
    public CollectorKpiService(KpiConfigFactory factory) {
        this.bonusCalculator = factory.createBonusCalculator();
        this.kpiEvaluator = factory.createKpiEvaluator();
    }

    public BonusCalculator getBonusCalculator() {
        return bonusCalculator;
    }

    public KpiEvaluator getKpiEvaluator() {
        return kpiEvaluator;
    }

    private String key(UUID collectorId, String areaName, LocalDate date) {
        return collectorId + ":" + areaName + ":" + date;
    }

    @Override
    public CollectorKpiDaily setKpiTargets(UUID collectorUserId, String collectorName,
            String areaName, LocalDate kpiDate,
            double minWeightKg, int minVisits) {
        if (minWeightKg < 0)
            throw new IllegalArgumentException("minWeightKg cannot be negative");
        if (minVisits < 0)
            throw new IllegalArgumentException("minVisits cannot be negative");
        String k = key(collectorUserId, areaName, kpiDate);
        CollectorKpiDaily kpi = store.computeIfAbsent(k,
                x -> new CollectorKpiDaily(collectorUserId, collectorName, areaName, kpiDate));
        kpi.setTargets(minWeightKg, minVisits);
        return kpi;
    }

    /** Observer Pattern: called after each collection visit event. */
    @Override
    public void updateKpiAfterVisit(UUID collectorUserId, String collectorName,
            String areaName, LocalDate date, double weightKg) {
        String k = key(collectorUserId, areaName, date);
        CollectorKpiDaily kpi = store.computeIfAbsent(k,
                x -> new CollectorKpiDaily(collectorUserId, collectorName, areaName, date));
        kpi.incrementVisit(weightKg);
        // Re-evaluate using Abstract Factory Product B
        if (kpiEvaluator.isMet(kpi) && kpi.getStatus() == CollectorKpiStatus.PENDING) {
            kpi.finalize();
        }
    }

    /** Finalize KPIs: uses Abstract Factory products for evaluation + bonus. */
    @Override
    public void finalizeKpisForDate(LocalDate date) {
        int finalized = 0;
        for (CollectorKpiDaily kpi : store.values()) {
            if (kpi.getKpiDate().equals(date) && kpi.getStatus() == CollectorKpiStatus.PENDING) {
                boolean met = kpiEvaluator.isMet(kpi); // Abstract Factory Product B
                kpi.setFinalStatus(met ? CollectorKpiStatus.MET : CollectorKpiStatus.NOT_MET);
                if (met) {
                    int bonus = bonusCalculator.calculate(kpi); // Abstract Factory Product A
                    bonusLog.add("[BONUS] " + kpi.getCollectorName()
                            + " earned " + bonus + " pts on " + date);
                }
                finalized++;
            }
        }
        System.out.println();
        System.out.println("  [i]   Finalized " + finalized + " KPI records for " + date);
        for (String log : bonusLog)
            System.out.println("  [OK]  " + log);
        bonusLog.clear();
    }

    @Override
    public CollectorKpiDaily getKpi(UUID id, String area, LocalDate date) {
        return store.get(key(id, area, date));
    }

    @Override
    public List<CollectorKpiDaily> getAllKpis() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<CollectorKpiDaily> getKpisByCollector(UUID id) {
        return store.values().stream().filter(k -> k.getCollectorUserId().equals(id)).collect(Collectors.toList());
    }

    @Override
    public List<CollectorKpiDaily> getKpisByDate(LocalDate date) {
        return store.values().stream().filter(k -> k.getKpiDate().equals(date)).collect(Collectors.toList());
    }
}
