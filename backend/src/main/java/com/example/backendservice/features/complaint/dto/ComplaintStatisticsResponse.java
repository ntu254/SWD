package com.example.backendservice.features.complaint.dto;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintStatisticsResponse {
    private long totalComplaints;
    private Map<String, Long> byStatus;
    private Map<String, Long> byCategory;
    private Map<String, Long> byPriority;
}
