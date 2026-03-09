package demo.uc29.config;

/** Abstract Factory Interface (UC-29). */
public interface ItemConfigFactory {
    StockPolicy createStockPolicy();

    RedeemValidator createRedeemValidator();

    String getFactoryName();
}
