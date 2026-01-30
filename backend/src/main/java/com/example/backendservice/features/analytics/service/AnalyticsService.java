package com.example.backendservice.features.analytics.service;

import com.example.backendservice.features.analytics.dto.*;

import java.time.LocalDate;
import java.util.UUID;

public interface AnalyticsService {

    EnterpriseAnalyticsResponse getEnterpriseAnalytics(
            UUID enterpriseId,
            LocalDate startDate,
            LocalDate endDate);

    EnterpriseSummaryDTO getEnterpriseSummary(
            UUID enterpriseId,
            LocalDate startDate,
            LocalDate endDate);

    java.util.List<WasteTypeSummaryDTO> getWasteTypeBreakdown(
            UUID enterpriseId,
            LocalDate startDate,
            LocalDate endDate);

    java.util.List<AreaSummaryDTO> getAreaBreakdown(
            UUID enterpriseId,
            LocalDate startDate,
            LocalDate endDate);

    java.util.List<DailyStatDTO> getDailyStats(
            UUID enterpriseId,
            LocalDate startDate,
            LocalDate endDate);
}
