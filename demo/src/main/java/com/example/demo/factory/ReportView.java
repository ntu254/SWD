package com.example.demo.factory;

import com.example.demo.model.Report;

import java.util.List;

/**
 * Abstract Product - interface cho các cách hiển thị report.
 */
public interface ReportView {
    void display(List<Report> reports);
    String getViewName();
}
