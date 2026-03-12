package com.wastecollection.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStatsDto {
    private long totalUsers;
    private long totalCitizens;
    private long totalCollectors;
    private long totalEnterprises;
    private long totalReports;
    private long pendingReports;
    private long activeTasks;
    private long completedTasksToday;
    private long openComplaints;
    private long totalRewardPointsIssued;
}
