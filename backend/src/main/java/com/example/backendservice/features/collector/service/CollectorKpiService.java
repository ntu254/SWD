package com.example.backendservice.features.collector.service;

import com.example.backendservice.features.collector.dto.CollectorKpiDailyResponse;
import com.example.backendservice.features.collector.entity.CollectorKpiDaily;
import com.example.backendservice.features.collector.repository.CollectorKpiDailyRepository;
import com.example.backendservice.features.collection.entity.CollectionVisit;
import com.example.backendservice.features.collection.repository.CollectionVisitRepository;
import com.example.backendservice.features.collection.repository.VisitWasteItemRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CollectorKpiService {

    private final CollectorKpiDailyRepository kpiRepository;
    private final CollectionVisitRepository visitRepository;
    private final VisitWasteItemRepository wasteItemRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;

    /**
     * Update KPI for a collector after a visit
     */
    @Transactional
    public void updateKpiAfterVisit(CollectionVisit visit) {
        UUID collectorUserId = visit.getCollectorUserId();
        LocalDate visitDate = visit.getVisitedAt().toLocalDate();

        // Get area from task
        UUID areaId = visit.getTask().getArea() != null ? visit.getTask().getArea().getAreaId() : null;
        if (areaId == null) {
            log.warn("Cannot update KPI: task has no area for visit {}", visit.getVisitId());
            return;
        }

        // Find or create KPI record
        CollectorKpiDaily kpi = kpiRepository
                .findByCollectorUserIdAndAreaIdAndKpiDate(collectorUserId, areaId, visitDate)
                .orElseGet(() -> createNewKpi(collectorUserId, areaId, visitDate));

        // Calculate weight from this visit
        Double visitWeight = wasteItemRepository.sumWeightByVisitId(visit.getVisitId());
        if (visitWeight == null)
            visitWeight = 0.0;

        // Increment KPI
        kpi.incrementVisit(visitWeight);

        // Check if KPI is met
        if (kpi.isKpiMet()) {
            kpi.setStatus("MET");
        }

        kpiRepository.save(kpi);
        log.info("Updated KPI for collector {} on {}: visits={}, weight={}kg",
                collectorUserId, visitDate, kpi.getActualVisits(), kpi.getActualWeightKg());
    }

    private CollectorKpiDaily createNewKpi(UUID collectorUserId, UUID areaId, LocalDate kpiDate) {
        User collector = userRepository.findByUserId(collectorUserId).orElse(null);
        ServiceArea area = serviceAreaRepository.findByAreaId(areaId).orElse(null);

        return CollectorKpiDaily.builder()
                .collectorUser(collector)
                .area(area)
                .kpiDate(kpiDate)
                .minWeightKg(50.0) // Default target: 50kg/day
                .minVisits(5) // Default target: 5 visits/day
                .actualWeightKg(0.0)
                .actualVisits(0)
                .status("PENDING")
                .build();
    }

    /**
     * Set KPI targets for a collector
     */
    @Transactional
    public CollectorKpiDailyResponse setKpiTargets(UUID collectorUserId, UUID areaId, LocalDate kpiDate,
            Double minWeightKg, Integer minVisits) {
        User collector = userRepository.findByUserId(collectorUserId)
                .orElseThrow(() -> new IllegalArgumentException("Collector not found: " + collectorUserId));

        ServiceArea area = serviceAreaRepository.findByAreaId(areaId)
                .orElseThrow(() -> new IllegalArgumentException("Service area not found: " + areaId));

        CollectorKpiDaily kpi = kpiRepository.findByCollectorUserIdAndAreaIdAndKpiDate(collectorUserId, areaId, kpiDate)
                .orElse(CollectorKpiDaily.builder()
                        .collectorUser(collector)
                        .area(area)
                        .kpiDate(kpiDate)
                        .actualWeightKg(0.0)
                        .actualVisits(0)
                        .status("PENDING")
                        .build());

        kpi.setMinWeightKg(minWeightKg);
        kpi.setMinVisits(minVisits);

        kpi = kpiRepository.save(kpi);
        log.info("Set KPI targets for collector {} in area {} on {}: minWeight={}kg, minVisits={}",
                collectorUserId, areaId, kpiDate, minWeightKg, minVisits);

        return toResponse(kpi);
    }

    /**
     * Finalize daily KPIs (run at end of day)
     */
    @Transactional
    public void finalizeKpisForDate(LocalDate date) {
        List<CollectorKpiDaily> pendingKpis = kpiRepository.findByStatusAndKpiDate("PENDING", date);

        for (CollectorKpiDaily kpi : pendingKpis) {
            if (kpi.isKpiMet()) {
                kpi.setStatus("MET");
            } else {
                kpi.setStatus("NOT_MET");
            }
            kpiRepository.save(kpi);
        }

        log.info("Finalized {} KPIs for date {}", pendingKpis.size(), date);
    }

    public CollectorKpiDailyResponse getKpiByCollectorAndDate(UUID collectorUserId, LocalDate date) {
        return kpiRepository.findByCollectorUserIdAndKpiDate(collectorUserId, date)
                .map(this::toResponse)
                .orElse(null);
    }

    public List<CollectorKpiDailyResponse> getKpisByCollector(UUID collectorUserId, LocalDate startDate,
            LocalDate endDate) {
        return kpiRepository.findByCollectorUserIdAndKpiDateBetween(collectorUserId, startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CollectorKpiDailyResponse> getKpisByArea(UUID areaId, LocalDate date) {
        return kpiRepository.findByAreaIdAndKpiDate(areaId, date).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private CollectorKpiDailyResponse toResponse(CollectorKpiDaily kpi) {
        double weightProgress = kpi.getMinWeightKg() > 0 ? (kpi.getActualWeightKg() / kpi.getMinWeightKg()) * 100 : 0;
        double visitsProgress = kpi.getMinVisits() > 0 ? ((double) kpi.getActualVisits() / kpi.getMinVisits()) * 100
                : 0;

        return CollectorKpiDailyResponse.builder()
                .kpiId(kpi.getKpiId())
                .collectorUserId(kpi.getCollectorUserId())
                .collectorName(kpi.getCollectorUser() != null ? kpi.getCollectorUser().getFullName() : null)
                .areaId(kpi.getArea() != null ? kpi.getArea().getAreaId() : null)
                .areaName(kpi.getArea() != null ? kpi.getArea().getName() : null)
                .kpiDate(kpi.getKpiDate())
                .minWeightKg(kpi.getMinWeightKg())
                .minVisits(kpi.getMinVisits())
                .actualWeightKg(kpi.getActualWeightKg())
                .actualVisits(kpi.getActualVisits())
                .weightProgress(weightProgress)
                .visitsProgress(visitsProgress)
                .status(kpi.getStatus())
                .updatedAt(kpi.getUpdatedAt())
                .build();
    }
}
