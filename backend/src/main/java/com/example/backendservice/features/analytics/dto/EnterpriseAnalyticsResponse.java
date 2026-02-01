package com.example.backendservice.features.analytics.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnterpriseAnalyticsResponse {

    private EnterpriseSummaryDTO summary;
    private List<WasteTypeSummaryDTO> byWasteType;
    private List<AreaSummaryDTO> byArea;
    private List<DailyStatDTO> dailyStats;
}
