package com.example.backendservice.features.analytics.dto;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalAnalyticsResponse {
    private GlobalSummaryDTO summary;
    private List<WasteTypeSummaryDTO> byWasteType;
    private List<AreaSummaryDTO> byArea;
    private List<DailyStatDTO> dailyStats;
}
