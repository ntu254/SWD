package demo.uc17.decorator;

import demo.common.Colors;
import demo.uc17.entity.CollectorKpiDaily;
import demo.uc17.service.KpiService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/** Concrete Decorator 1 (UC-17): Logs KPI target setting and visit updates. */
public class LoggingKpiServiceDecorator extends KpiServiceDecorator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public LoggingKpiServiceDecorator(KpiService wrapped) {
        super(wrapped);
    }

    @Override
    public CollectorKpiDaily setKpiTargets(UUID id, String name, String area,
            LocalDate date, double minW, int minV) {
        log("[KPI_SET] " + name + " | area=" + area + " | target: " + minW + "kg, " + minV + " visits");
        CollectorKpiDaily kpi = wrapped.setKpiTargets(id, name, area, date, minW, minV);
        log("[KPI_SET] OK | status=" + kpi.getStatus());
        return kpi;
    }

    @Override
    public void updateKpiAfterVisit(UUID id, String name, String area, LocalDate date, double weight) {
        log("[VISIT] " + name + " | area=" + area + " | collected=" + weight + "kg");
        wrapped.updateKpiAfterVisit(id, name, area, date, weight);
        CollectorKpiDaily kpi = wrapped.getKpi(id, area, date);
        if (kpi != null)
            log("[VISIT] Progress -> weight=" + String.format("%.1f", kpi.getActualWeightKg())
                    + "/" + kpi.getMinWeightKg() + "kg | visits=" + kpi.getActualVisits()
                    + "/" + kpi.getMinVisits() + " | status=" + kpi.getStatus());
    }

    @Override
    public void finalizeKpisForDate(LocalDate date) {
        log("[FINALIZE] Starting KPI finalization for date: " + date);
        wrapped.finalizeKpisForDate(date);
        log("[FINALIZE] Done");
    }

    private void log(String msg) {
        System.out.println(Colors.purple("  [LOG " + LocalDateTime.now().format(FMT) + "] " + msg));
    }
}
