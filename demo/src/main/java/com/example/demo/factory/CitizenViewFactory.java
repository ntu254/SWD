package com.example.demo.factory;

/**
 * Concrete Factory cho Citizen - tạo CitizenReportView (UC-04).
 */
public class CitizenViewFactory implements ViewFactory {

    @Override
    public ReportView createReportView() {
        return new CitizenReportView();
    }
}
