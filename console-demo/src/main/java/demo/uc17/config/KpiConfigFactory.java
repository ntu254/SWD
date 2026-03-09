package demo.uc17.config;

/** Abstract Factory Interface (UC-17). */
public interface KpiConfigFactory {
    BonusCalculator createBonusCalculator();

    KpiEvaluator createKpiEvaluator();

    String getFactoryName();
}
