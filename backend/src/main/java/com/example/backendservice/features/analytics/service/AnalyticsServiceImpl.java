package com.example.backendservice.features.analytics.service;

import com.example.backendservice.features.analytics.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final TaskRepository taskRepository;

    @Override
    @Transactional(readOnly = true)
    public EnterpriseAnalyticsResponse getEnterpriseAnalytics(
            UUID enterpriseId, LocalDate startDate, LocalDate endDate) {

        log.info("Generating analytics for enterprise: {} from {} to {}",
                enterpriseId, startDate, endDate);

        return EnterpriseAnalyticsResponse.builder()
                .summary(getEnterpriseSummary(enterpriseId, startDate, endDate))
                .byWasteType(getWasteTypeBreakdown(enterpriseId, startDate, endDate))
                .byArea(getAreaBreakdown(enterpriseId, startDate, endDate))
                .dailyStats(getDailyStats(enterpriseId, startDate, endDate))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public EnterpriseSummaryDTO getEnterpriseSummary(
            UUID enterpriseId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        // Get all tasks for the enterprise in date range
        List<Task> tasks = taskRepository.findByEnterpriseId(enterpriseId,
                org.springframework.data.domain.Pageable.unpaged()).getContent()
                .stream()
                .filter(t -> t.getCreatedAt() != null &&
                        t.getCreatedAt().isAfter(start) &&
                        t.getCreatedAt().isBefore(end))
                .collect(Collectors.toList());

        long totalTasks = tasks.size();
        long pendingTasks = tasks.stream().filter(t -> "PENDING".equals(t.getStatus())).count();
        long completedTasks = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long cancelledTasks = tasks.stream().filter(t -> "CANCELLED".equals(t.getStatus())).count();

        Double totalWeight = tasks.stream()
                .filter(t -> t.getActualWeightKg() != null)
                .mapToDouble(Task::getActualWeightKg)
                .sum();

        Double avgWeight = completedTasks > 0 ? totalWeight / completedTasks : 0.0;

        Integer totalPoints = tasks.stream()
                .filter(t -> t.getPointsAwarded() != null)
                .mapToInt(Task::getPointsAwarded)
                .sum();

        return EnterpriseSummaryDTO.builder()
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .completedTasks(completedTasks)
                .cancelledTasks(cancelledTasks)
                .totalWeightCollectedKg(totalWeight)
                .averageWeightPerTaskKg(avgWeight)
                .totalPointsAwarded(totalPoints)
                .periodStart(startDate)
                .periodEnd(endDate)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<WasteTypeSummaryDTO> getWasteTypeBreakdown(
            UUID enterpriseId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Task> tasks = taskRepository.findByEnterpriseId(enterpriseId,
                org.springframework.data.domain.Pageable.unpaged()).getContent()
                .stream()
                .filter(t -> t.getCreatedAt() != null &&
                        t.getCreatedAt().isAfter(start) &&
                        t.getCreatedAt().isBefore(end) &&
                        t.getWasteType() != null)
                .collect(Collectors.toList());

        Double totalWeight = tasks.stream()
                .filter(t -> t.getActualWeightKg() != null)
                .mapToDouble(Task::getActualWeightKg)
                .sum();

        Map<UUID, List<Task>> groupedByWasteType = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getWasteType().getId()));

        return groupedByWasteType.entrySet().stream()
                .map(entry -> {
                    List<Task> typeTasks = entry.getValue();
                    Task sample = typeTasks.get(0);
                    Double typeWeight = typeTasks.stream()
                            .filter(t -> t.getActualWeightKg() != null)
                            .mapToDouble(Task::getActualWeightKg)
                            .sum();
                    Integer typePoints = typeTasks.stream()
                            .filter(t -> t.getPointsAwarded() != null)
                            .mapToInt(Task::getPointsAwarded)
                            .sum();

                    return WasteTypeSummaryDTO.builder()
                            .wasteTypeId(entry.getKey())
                            .wasteTypeName(sample.getWasteType().getName())
                            .taskCount((long) typeTasks.size())
                            .totalWeightKg(typeWeight)
                            .percentageOfTotal(totalWeight > 0 ? (typeWeight / totalWeight) * 100 : 0)
                            .pointsAwarded(typePoints)
                            .build();
                })
                .sorted(Comparator.comparingDouble(WasteTypeSummaryDTO::getTotalWeightKg).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AreaSummaryDTO> getAreaBreakdown(
            UUID enterpriseId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Task> tasks = taskRepository.findByEnterpriseId(enterpriseId,
                org.springframework.data.domain.Pageable.unpaged()).getContent()
                .stream()
                .filter(t -> t.getCreatedAt() != null &&
                        t.getCreatedAt().isAfter(start) &&
                        t.getCreatedAt().isBefore(end) &&
                        t.getArea() != null)
                .collect(Collectors.toList());

        Double totalWeight = tasks.stream()
                .filter(t -> t.getActualWeightKg() != null)
                .mapToDouble(Task::getActualWeightKg)
                .sum();

        Map<UUID, List<Task>> groupedByArea = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getArea().getId()));

        return groupedByArea.entrySet().stream()
                .map(entry -> {
                    List<Task> areaTasks = entry.getValue();
                    Task sample = areaTasks.get(0);
                    Double areaWeight = areaTasks.stream()
                            .filter(t -> t.getActualWeightKg() != null)
                            .mapToDouble(Task::getActualWeightKg)
                            .sum();
                    long completed = areaTasks.stream()
                            .filter(t -> "COMPLETED".equals(t.getStatus()))
                            .count();

                    return AreaSummaryDTO.builder()
                            .areaId(entry.getKey())
                            .areaName(sample.getArea().getName())
                            .taskCount((long) areaTasks.size())
                            .completedTasks(completed)
                            .totalWeightKg(areaWeight)
                            .percentageOfTotal(totalWeight > 0 ? (areaWeight / totalWeight) * 100 : 0)
                            .build();
                })
                .sorted(Comparator.comparingDouble(AreaSummaryDTO::getTotalWeightKg).reversed())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyStatDTO> getDailyStats(
            UUID enterpriseId, LocalDate startDate, LocalDate endDate) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.plusDays(1).atStartOfDay();

        List<Task> tasks = taskRepository.findByEnterpriseId(enterpriseId,
                org.springframework.data.domain.Pageable.unpaged()).getContent()
                .stream()
                .filter(t -> t.getCreatedAt() != null &&
                        t.getCreatedAt().isAfter(start) &&
                        t.getCreatedAt().isBefore(end))
                .collect(Collectors.toList());

        Map<LocalDate, List<Task>> groupedByDate = tasks.stream()
                .collect(Collectors.groupingBy(t -> t.getCreatedAt().toLocalDate()));

        List<DailyStatDTO> dailyStats = new ArrayList<>();

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<Task> dayTasks = groupedByDate.getOrDefault(date, Collections.emptyList());

            long created = dayTasks.size();
            long completed = dayTasks.stream()
                    .filter(t -> "COMPLETED".equals(t.getStatus()) &&
                            t.getCompletedAt() != null &&
                            t.getCompletedAt().toLocalDate().equals(date))
                    .count();
            Double weight = dayTasks.stream()
                    .filter(t -> t.getActualWeightKg() != null)
                    .mapToDouble(Task::getActualWeightKg)
                    .sum();
            Integer points = dayTasks.stream()
                    .filter(t -> t.getPointsAwarded() != null)
                    .mapToInt(Task::getPointsAwarded)
                    .sum();

            dailyStats.add(DailyStatDTO.builder()
                    .date(date)
                    .tasksCreated(created)
                    .tasksCompleted(completed)
                    .weightCollectedKg(weight)
                    .pointsAwarded(points)
                    .build());
        }

        return dailyStats;
    }
}
