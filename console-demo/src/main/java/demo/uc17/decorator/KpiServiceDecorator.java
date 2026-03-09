package demo.uc17.decorator;

import demo.uc17.entity.CollectorKpiDaily;
import demo.uc17.service.KpiService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Abstract Decorator (UC-17): Wraps KpiService and delegates all calls. */
public abstract class KpiServiceDecorator implements KpiService {

    protected final KpiService wrapped;

    protected KpiServiceDecorator(KpiService wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public CollectorKpiDaily setKpiTargets(UUID id, String name, String area,
            LocalDate date, double minW, int minV) {
        return wrapped.setKpiTargets(id, name, area, date, minW, minV);
    }

    @Override
    public void updateKpiAfterVisit(UUID id, String name, String area,
            LocalDate date, double weight) {
        wrapped.updateKpiAfterVisit(id, name, area, date, weight);
    }

    @Override
    public void finalizeKpisForDate(LocalDate date) {
        wrapped.finalizeKpisForDate(date);
    }

    @Override
    public CollectorKpiDaily getKpi(UUID id, String area, LocalDate date) {
        return wrapped.getKpi(id, area, date);
    }

    @Override
    public List<CollectorKpiDaily> getAllKpis() {
        return wrapped.getAllKpis();
    }

    @Override
    public List<CollectorKpiDaily> getKpisByCollector(UUID id) {
        return wrapped.getKpisByCollector(id);
    }

    @Override
    public List<CollectorKpiDaily> getKpisByDate(LocalDate d) {
        return wrapped.getKpisByDate(d);
    }
}
