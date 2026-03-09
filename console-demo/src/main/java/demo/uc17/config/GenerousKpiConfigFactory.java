package demo.uc17.config;

import demo.uc17.entity.CollectorKpiDaily;

/**
 * Concrete Factory 2 (UC-17): Generous KPI Config
 * - BonusCalculator: 200 pts base + 10 pts per kg over target
 * - KpiEvaluator : EITHER weight OR visits met counts (lenient OR logic)
 */
public class GenerousKpiConfigFactory implements KpiConfigFactory {

    @Override
    public BonusCalculator createBonusCalculator() {
        return new BonusCalculator() {
            @Override
            public int calculate(CollectorKpiDaily kpi) {
                int base = 200;
                int extra = Math.max(0, (int) ((kpi.getActualWeightKg() - kpi.getMinWeightKg()) * 10));
                return base + extra;
            }

            @Override
            public String describe() {
                return "Generous: 200 pts base + 10 pts per kg over target";
            }
        };
    }

    @Override
    public KpiEvaluator createKpiEvaluator() {
        return new KpiEvaluator() {
            @Override
            public boolean isMet(CollectorKpiDaily kpi) {
                return kpi.getActualWeightKg() >= kpi.getMinWeightKg()
                        || kpi.getActualVisits() >= kpi.getMinVisits();
            }

            @Override
            public String describe() {
                return "Generous: EITHER weight OR visits reaching target is enough";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Generous KPI Config (OR, 200+ pts bonus)";
    }
}
