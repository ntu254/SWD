package com.example.backendservice.features.analytics.service;

import com.example.backendservice.features.analytics.dto.*;
import com.example.backendservice.features.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of AnalyticsService
 * Provides analytics data for enterprise operations using real database queries
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

        private final AnalyticsRepository analyticsRepository;

        @Override
        public EnterpriseAnalyticsResponse getEnterpriseAnalytics(
                        UUID enterpriseId,
                        LocalDate startDate,
                        LocalDate endDate) {

                log.info("Getting enterprise analytics for enterprise {} from {} to {}",
                                enterpriseId, startDate, endDate);

                EnterpriseSummaryDTO summary = getEnterpriseSummary(enterpriseId, startDate, endDate);
                List<WasteTypeSummaryDTO> wasteTypeBreakdown = getWasteTypeBreakdown(enterpriseId, startDate, endDate);
                List<AreaSummaryDTO> areaBreakdown = getAreaBreakdown(enterpriseId, startDate, endDate);
                List<DailyStatDTO> dailyStats = getDailyStats(enterpriseId, startDate, endDate);

                return EnterpriseAnalyticsResponse.builder()
                                .summary(summary)
                                .byWasteType(wasteTypeBreakdown)
                                .byArea(areaBreakdown)
                                .dailyStats(dailyStats)
                                .build();
        }

        @Override
        public EnterpriseSummaryDTO getEnterpriseSummary(
                        UUID enterpriseId,
                        LocalDate startDate,
                        LocalDate endDate) {

                log.debug("Getting summary for enterprise {} from {} to {}",
                                enterpriseId, startDate, endDate);

                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

                // Query task counts
                Long totalTasks = analyticsRepository.countTotalTasks(enterpriseId, startDateTime, endDateTime);
                Long pendingTasks = analyticsRepository.countTasksByStatus(enterpriseId, "PENDING", startDateTime,
                                endDateTime);
                Long completedTasks = analyticsRepository.countTasksByStatus(enterpriseId, "COMPLETED", startDateTime,
                                endDateTime);
                Long cancelledTasks = analyticsRepository.countTasksByStatus(enterpriseId, "CANCELLED", startDateTime,
                                endDateTime);

                // Query weight
                Double totalWeight = analyticsRepository.sumTotalWeightCollected(enterpriseId, startDateTime,
                                endDateTime);
                Double avgWeight = (totalTasks != null && totalTasks > 0) ? totalWeight / totalTasks : 0.0;

                // Query collectors
                Long activeCollectors = analyticsRepository.countActiveCollectors(enterpriseId, startDateTime,
                                endDateTime);
                Double avgTasksPerCollector = (activeCollectors != null && activeCollectors > 0)
                                ? (double) totalTasks / activeCollectors
                                : 0.0;

                // Query points
                Integer totalPoints = analyticsRepository.sumPointsAwarded(enterpriseId, startDateTime, endDateTime);

                // Query reports
                Long reportsReceived = analyticsRepository.countReportsReceived(enterpriseId, startDateTime,
                                endDateTime);

                return EnterpriseSummaryDTO.builder()
                                .totalTasks(totalTasks != null ? totalTasks : 0L)
                                .pendingTasks(pendingTasks != null ? pendingTasks : 0L)
                                .completedTasks(completedTasks != null ? completedTasks : 0L)
                                .cancelledTasks(cancelledTasks != null ? cancelledTasks : 0L)
                                .totalWeightCollectedKg(totalWeight != null ? totalWeight : 0.0)
                                .averageWeightPerTaskKg(avgWeight)
                                .totalReportsReceived(reportsReceived != null ? reportsReceived : 0L)
                                .reportsAccepted(completedTasks != null ? completedTasks : 0L)
                                .reportsRejected(cancelledTasks != null ? cancelledTasks : 0L)
                                .activeCollectors(activeCollectors != null ? activeCollectors : 0L)
                                .averageTasksPerCollector(avgTasksPerCollector)
                                .totalPointsAwarded(totalPoints != null ? totalPoints : 0)
                                .periodStart(startDate)
                                .periodEnd(endDate)
                                .build();
        }

        @Override
        public List<WasteTypeSummaryDTO> getWasteTypeBreakdown(
                        UUID enterpriseId,
                        LocalDate startDate,
                        LocalDate endDate) {

                log.debug("Getting waste type breakdown for enterprise {} from {} to {}",
                                enterpriseId, startDate, endDate);

                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

                List<Object[]> results = analyticsRepository.getWasteTypeBreakdown(enterpriseId, startDateTime,
                                endDateTime);

                // Calculate total weight for percentage
                double totalWeight = results.stream()
                                .mapToDouble(row -> row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                                .sum();

                return results.stream()
                                .map(row -> WasteTypeSummaryDTO.builder()
                                                .wasteTypeId((UUID) row[0])
                                                .wasteTypeName((String) row[1])
                                                .taskCount(((Number) row[2]).longValue())
                                                .totalWeightKg(row[3] != null ? ((Number) row[3]).doubleValue() : 0.0)
                                                .percentageOfTotal(totalWeight > 0
                                                                ? (row[3] != null ? ((Number) row[3]).doubleValue()
                                                                                : 0.0) / totalWeight * 100
                                                                : 0.0)
                                                .pointsAwarded(0) // Would need separate query
                                                .build())
                                .collect(Collectors.toList());
        }

        @Override
        public List<AreaSummaryDTO> getAreaBreakdown(
                        UUID enterpriseId,
                        LocalDate startDate,
                        LocalDate endDate) {

                log.debug("Getting area breakdown for enterprise {} from {} to {}",
                                enterpriseId, startDate, endDate);

                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

                List<Object[]> results = analyticsRepository.getAreaBreakdown(enterpriseId, startDateTime, endDateTime);

                // Calculate total tasks for percentage
                long totalTasks = results.stream()
                                .mapToLong(row -> row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                .sum();

                return results.stream()
                                .map(row -> AreaSummaryDTO.builder()
                                                .areaId((UUID) row[0])
                                                .areaName((String) row[1])
                                                .taskCount(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                                .completedTasks(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                                                .totalWeightKg(0.0) // Would need join with VisitWasteItem
                                                .percentageOfTotal(totalTasks > 0
                                                                ? (row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                                                                * 100.0 / totalTasks
                                                                : 0.0)
                                                .activeCollectors(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                                                .build())
                                .collect(Collectors.toList());
        }

        @Override
        public List<DailyStatDTO> getDailyStats(
                        UUID enterpriseId,
                        LocalDate startDate,
                        LocalDate endDate) {

                log.debug("Getting daily stats for enterprise {} from {} to {}",
                                enterpriseId, startDate, endDate);

                LocalDateTime startDateTime = startDate.atStartOfDay();
                LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

                // Get task stats per day
                List<Object[]> taskStats = analyticsRepository.getDailyTaskStats(enterpriseId, startDateTime,
                                endDateTime);

                // Get weight stats per day
                List<Object[]> weightStats = analyticsRepository.getDailyWeightStats(enterpriseId, startDateTime,
                                endDateTime);

                // Merge results by date
                Map<LocalDate, DailyStatDTO> dateMap = new LinkedHashMap<>();

                // Initialize with task stats
                for (Object[] row : taskStats) {
                        LocalDate date = (LocalDate) row[0];
                        dateMap.put(date, DailyStatDTO.builder()
                                        .date(date)
                                        .tasksCreated(row[1] != null ? ((Number) row[1]).longValue() : 0L)
                                        .tasksCompleted(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                                        .weightCollectedKg(0.0)
                                        .pointsAwarded(0)
                                        .build());
                }

                // Add weight data
                for (Object[] row : weightStats) {
                        LocalDate date = (LocalDate) row[0];
                        DailyStatDTO existing = dateMap.get(date);
                        if (existing != null) {
                                existing.setWeightCollectedKg(row[1] != null ? ((Number) row[1]).doubleValue() : 0.0);
                        } else {
                                dateMap.put(date, DailyStatDTO.builder()
                                                .date(date)
                                                .tasksCreated(0L)
                                                .tasksCompleted(0L)
                                                .weightCollectedKg(
                                                                row[1] != null ? ((Number) row[1]).doubleValue() : 0.0)
                                                .pointsAwarded(0)
                                                .build());
                        }
                }

                // Sort by date
                return dateMap.entrySet().stream()
                                .sorted(Map.Entry.comparingByKey())
                                .map(Map.Entry::getValue)
                                .collect(Collectors.toList());
        }
}
