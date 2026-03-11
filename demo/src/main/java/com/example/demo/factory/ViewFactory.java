package com.example.demo.factory;

/**
 * Abstract Factory - tạo các view phù hợp theo role (Citizen / Enterprise).
 */
public interface ViewFactory {
    ReportView createReportView();
}
