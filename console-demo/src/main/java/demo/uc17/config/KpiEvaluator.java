package demo.uc17.config;

import demo.uc17.entity.CollectorKpiDaily;

/** Abstract Product B (UC-17): Evaluates whether a collector's KPI is met. */
public interface KpiEvaluator {
    boolean isMet(CollectorKpiDaily kpi);

    String describe();
}
