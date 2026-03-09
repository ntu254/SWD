package demo.uc17.config;

import demo.uc17.entity.CollectorKpiDaily;

/** Abstract Product A (UC-17): Calculates bonus points when KPI is met. */
public interface BonusCalculator {
    int calculate(CollectorKpiDaily kpi);

    String describe();
}
