package com.example.demo.factory;

/**
 * Concrete Factory cho Enterprise - tạo EnterpriseReportView (UC-09).
 */
public class EnterpriseViewFactory implements ViewFactory {

    @Override
    public ReportView createReportView() {
        return new EnterpriseReportView();
    }
}
