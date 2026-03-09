package demo.uc17.config;

import demo.uc17.entity.CollectorKpiDaily;

/**
 * Concrete Factory 1 (UC-17): Standard KPI Config
 * - BonusCalculator: flat 100 pts for meeting KPI
 * - KpiEvaluator : BOTH weight AND visits must be met (strict AND logic)
 */
public class StandardKpiConfigFactory implements KpiConfigFactory {

    @Override
    public BonusCalculator createBonusCalculator() {
        return new BonusCalculator() {
            @Override
            public int calculate(CollectorKpiDaily kpi) {
                return 100;
            }

            @Override
            public String describe() {
                return "Standard: flat 100 pts bonus";
            }
        };
    }

    @Override
    public KpiEvaluator createKpiEvaluator() {
        return new KpiEvaluator() {
            @Override
            public boolean isMet(CollectorKpiDaily kpi) {
                return kpi.getActualWeightKg() >= kpi.getMinWeightKg()
                        && kpi.getActualVisits() >= kpi.getMinVisits();
            }

            @Override
            public String describe() {
                return "Standard: BOTH weight AND visits must reach target";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Standard KPI Config (AND, 100 pts bonus)";
    }
}
