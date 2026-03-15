package com.wastecollection.service;

import com.wastecollection.common.PageResponse;
import com.wastecollection.dto.report.ReportDto;
import com.wastecollection.dto.task.*;
import com.wastecollection.entity.*;
import com.wastecollection.exception.BadRequestException;
import com.wastecollection.exception.ForbiddenException;
import com.wastecollection.exception.ResourceNotFoundException;
import com.wastecollection.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {
    private static final List<String> ACTIVE_ASSIGNMENT_STATUSES = List.of("ASSIGNED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS");
    private static final List<String> COLLECTOR_VISIBLE_ASSIGNMENT_STATUSES = List.of("ASSIGNED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS", "COMPLETED");

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final CollectionVisitRepository visitRepository;
    private final EvidencePhotoRepository photoRepository;
    private final VisitWasteItemRepository wasteItemRepository;
    private final WasteReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final EnterpriseCapabilityRepository capabilityRepository;
    private final RewardService rewardService;
    private final CollectorKpiDailyRepository kpiRepository;

    @Transactional
    public TaskDto createTask(UUID creatorId, CreateTaskRequest request) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", creatorId));
        User enterprise = userRepository.findById(request.getEnterpriseUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise", "id", request.getEnterpriseUserId()));

        Task task = Task.builder()
                .enterprise(enterprise)
                .createdBy(creator)
                .status("PENDING")
                .priority(request.getPriority())
                .scheduledDate(request.getScheduledDate())
                .build();

        if (request.getReportId() != null) {
            WasteReport report = reportRepository.findById(request.getReportId())
                    .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", request.getReportId()));
            task.setReport(report);
            report.setStatus("ACCEPTED");
            reportRepository.save(report);
        }

        if (request.getAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getAreaId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceArea", "id", request.getAreaId()));
            task.setArea(area);
        }

        return mapToDto(taskRepository.save(task));
    }

    @Transactional
    public TaskDto acceptReport(UUID reportId, UUID enterpriseId) {
        WasteReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", reportId));
        if (!"PENDING".equals(report.getStatus())) {
            throw new BadRequestException("Report is not in PENDING status");
        }
        User enterprise = userRepository.findById(enterpriseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise", "id", enterpriseId));
        ensureEnterpriseCanHandleReport(report, enterprise.getUserId());

        Task task = Task.builder()
                .report(report)
                .enterprise(enterprise)
                .createdBy(enterprise)
                .status("PENDING_ENTERPRISE_APPROVAL")
                .build();
        task = taskRepository.save(task);

        report.setStatus("ACCEPTED");
        reportRepository.save(report);
        return mapToDto(task);
    }

    @Transactional
    public ReportDto rejectReport(UUID reportId, UUID enterpriseId, String reason) {
        WasteReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("WasteReport", "id", reportId));
        if (!"PENDING".equals(report.getStatus())) {
            throw new BadRequestException("Report is not in PENDING status");
        }
        User enterprise = userRepository.findById(enterpriseId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise", "id", enterpriseId));
        ensureEnterpriseCanHandleReport(report, enterprise.getUserId());

        String normalizedReason = reason == null ? "" : reason.trim();
        if (!normalizedReason.isEmpty()) {
            log.info("Report {} rejected by enterprise {}. Reason: {}", reportId, enterpriseId, normalizedReason);
        }
        report.setStatus("REJECTED");
        reportRepository.save(report);
        // Return updated report info
        return ReportDto.builder()
                .reportId(report.getReportId())
                .status("REJECTED")
                .build();
    }

    @Transactional
    public TaskDto assignTask(UUID taskId, UUID enterpriseId, AssignTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        if (!task.getEnterprise().getUserId().equals(enterpriseId)) {
            throw new ForbiddenException("This task does not belong to your enterprise");
        }

        User collector = userRepository.findById(request.getCollectorUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Collector", "id", request.getCollectorUserId()));
        if (collector.getRole() != User.Role.COLLECTOR) {
            throw new BadRequestException("Selected user is not a collector");
        }

        List<TaskAssignment> activeAssignments = assignmentRepository
                .findAllByTask_TaskIdAndStatusIn(taskId, ACTIVE_ASSIGNMENT_STATUSES);
        for (TaskAssignment active : activeAssignments) {
            active.setStatus("UNASSIGNED");
            active.setUnassignedAt(LocalDateTime.now());
            assignmentRepository.save(active);
        }

        TaskAssignment assignment = TaskAssignment.builder()
                .task(task)
                .collector(collector)
                .status("ASSIGNED")
                .assignedAt(LocalDateTime.now())
                .build();
        assignmentRepository.save(assignment);

        task.setStatus("ASSIGNED");
        taskRepository.save(task);

        // Update report status
        if (task.getReport() != null) {
            task.getReport().setStatus("ASSIGNED");
            reportRepository.save(task.getReport());
        }

        return mapToDto(task);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskDto> getTasksForEnterprise(UUID enterpriseId, int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        String normalizedStatus = normalizeTaskFilterStatus(status);
        Page<Task> tasks = normalizedStatus != null
                ? taskRepository.findByEnterprise_UserIdAndStatus(enterpriseId, normalizedStatus, pageable)
                : taskRepository.findByEnterprise_UserId(enterpriseId, pageable);
        return toPageResponse(tasks);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskDto> getTasksForCollector(UUID collectorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("assignedAt").descending());
        Page<TaskAssignment> assignments = assignmentRepository
                .findByCollector_UserIdAndStatusIn(collectorId, COLLECTOR_VISIBLE_ASSIGNMENT_STATUSES, pageable);
        List<TaskDto> dtos = assignments.getContent().stream()
                .map(a -> mapToDto(a.getTask(), a))
                .toList();
        return new PageResponse<>(dtos, assignments.getNumber(), assignments.getSize(),
                assignments.getTotalElements(), assignments.getTotalPages(), assignments.isLast());
    }

    @Transactional
    public TaskDto updateAssignmentStatus(UUID taskId, UUID collectorId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        String normalized = newStatus == null ? "" : newStatus.trim().toUpperCase(Locale.ROOT);
        if (!List.of("ACCEPTED", "ON_THE_WAY", "IN_PROGRESS").contains(normalized)) {
            throw new BadRequestException("Unsupported collector status: " + newStatus);
        }

        TaskAssignment assignment = assignmentRepository
                .findByTask_TaskIdAndCollector_UserIdAndStatusIn(taskId, collectorId, ACTIVE_ASSIGNMENT_STATUSES)
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "taskId", taskId));

        if ("ACCEPTED".equals(normalized)) {
            assignment.setAcceptedAt(LocalDateTime.now());
            assignment.setStatus("ACCEPTED");
        } else {
            assignment.setStatus("ON_THE_WAY");
            task.setStatus("IN_PROGRESS");
            if (task.getReport() != null) {
                task.getReport().setStatus("ON_THE_WAY");
                reportRepository.save(task.getReport());
            }
        }
        assignmentRepository.save(assignment);
        taskRepository.save(task);

        return mapToDto(task);
    }

    @Transactional
    public TaskDto completeVisit(UUID taskId, UUID collectorId, CompleteVisitRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        TaskAssignment assignment = assignmentRepository
                .findByTask_TaskIdAndCollector_UserIdAndStatusIn(taskId, collectorId, ACTIVE_ASSIGNMENT_STATUSES)
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "taskId", taskId));
        assignment.setCollectorNote(request.getCollectorNote());

        CollectionVisit visit = CollectionVisit.builder()
                .task(task)
                .collector(assignment.getCollector())
                .visitStatus(request.getVisitStatus())
                .collectorNote(request.getCollectorNote())
                .visitedAt(LocalDateTime.now())
                .build();
        visit = visitRepository.save(visit);

        // Save evidence photos
        if (request.getPhotoUrls() != null) {
            for (String url : request.getPhotoUrls()) {
                photoRepository.save(EvidencePhoto.builder()
                        .visit(visit)
                        .photoUrl(url)
                        .takenAt(LocalDateTime.now())
                        .build());
            }
        }

        // Save waste items and compute rewards
        if (request.getWasteItems() != null) {
            for (CompleteVisitRequest.WasteItemInput item : request.getWasteItems()) {
                WasteType wasteType = item.getWasteTypeId() != null
                        ? new WasteType() : null;
                if (wasteType != null) wasteType.setWasteTypeId(item.getWasteTypeId());

                VisitWasteItem wasteItem = VisitWasteItem.builder()
                        .visit(visit)
                        .wasteType(wasteType)
                        .weightKg(item.getWeightKg())
                        .sortingLevel(item.getSortingLevel())
                        .contaminationNote(item.getContaminationNote())
                        .build();
                wasteItemRepository.save(wasteItem);
            }

            // Calculate and award points to citizen
            if (task.getReport() != null) {
                UUID citizenId = task.getReport().getReporter().getUserId();
                rewardService.calculateAndAwardPoints(citizenId, visit, request.getWasteItems());
            }
        }

        // Update statuses
        assignment.setStatus("COMPLETED");
        assignmentRepository.save(assignment);
        task.setStatus("COMPLETED");
        taskRepository.save(task);

        if (task.getReport() != null) {
            task.getReport().setStatus("COLLECTED");
            reportRepository.save(task.getReport());
        }

        // Track KPI for collector
        double visitWeight = request.getWasteItems() == null ? 0.0
                : request.getWasteItems().stream()
                        .mapToDouble(i -> i.getWeightKg() != null ? i.getWeightKg() : 0.0).sum();
        trackCollectorKpi(collectorId, visitWeight);

        return mapToDto(task);
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskForEnterprise(UUID taskId, UUID enterpriseId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        if (!task.getEnterprise().getUserId().equals(enterpriseId)) {
            throw new ForbiddenException("This task does not belong to your enterprise");
        }
        return mapToDto(task);
    }

    @Transactional(readOnly = true)
    public TaskDto getTaskForCollector(UUID taskId, UUID collectorId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));
        TaskAssignment assignment = assignmentRepository
                .findByTask_TaskIdAndCollector_UserIdAndStatusIn(taskId, collectorId, COLLECTOR_VISIBLE_ASSIGNMENT_STATUSES)
                .orElseThrow(() -> new ForbiddenException("This task is not assigned to you"));
        return mapToDto(task, assignment);
    }

    @Transactional(readOnly = true)
    public TaskDto getTask(UUID taskId) {
        return mapToDto(taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId)));
    }

    @Transactional(readOnly = true)
    public com.wastecollection.dto.enterprise.KpiConfigDto getTodayKpi(UUID collectorId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        CollectorKpiDaily kpi = getLatestCollectorKpiByDate(collectorId, today)
                .orElse(CollectorKpiDaily.builder()
                        .actualVisits(0)
                        .actualWeightKg(0.0)
                        .status("PENDING")
                        .build());
        return com.wastecollection.dto.enterprise.KpiConfigDto.builder()
                .kpiId(kpi.getKpiId())
                .collectorUserId(kpi.getCollector() != null ? kpi.getCollector().getUserId() : collectorId)
                .collectorName(kpi.getCollector() != null ? kpi.getCollector().getDisplayName() : null)
                .areaId(kpi.getArea() != null ? kpi.getArea().getAreaId() : null)
                .areaName(kpi.getArea() != null ? kpi.getArea().getName() : null)
                .kpiDate(kpi.getKpiDate() != null ? kpi.getKpiDate() : today)
                .minVisits(kpi.getMinVisits())
                .actualVisits(kpi.getActualVisits())
                .minWeightKg(kpi.getMinWeightKg())
                .actualWeightKg(kpi.getActualWeightKg())
                .status(kpi.getStatus())
                .build();
    }

    @Transactional
    void trackCollectorKpi(UUID collectorId, double weightKg) {
        try {
            LocalDate today = LocalDate.now();
            CollectorKpiDaily kpi = getLatestCollectorKpiByDate(collectorId, today).orElse(null);
            if (kpi == null) return; // KPI not configured yet for this collector today

            kpi.setActualVisits(kpi.getActualVisits() + 1);
            kpi.setActualWeightKg((kpi.getActualWeightKg() != null ? kpi.getActualWeightKg() : 0.0) + weightKg);

            boolean visitsMet = kpi.getMinVisits() == null || kpi.getActualVisits() >= kpi.getMinVisits();
            boolean weightMet = kpi.getMinWeightKg() == null || kpi.getActualWeightKg() >= kpi.getMinWeightKg();
            if (visitsMet && weightMet) {
                kpi.setStatus("MET");
            }
            kpiRepository.save(kpi);
        } catch (Exception e) {
            // KPI tracking is non-critical; log and continue
            log.warn("KPI tracking failed for collector {}: {}", collectorId, e.getMessage());
        }
    }

    private java.util.Optional<CollectorKpiDaily> getLatestCollectorKpiByDate(UUID collectorId, LocalDate kpiDate) {
        return kpiRepository.findAllByCollector_UserIdAndKpiDateOrderByUpdatedAtDesc(collectorId, kpiDate)
                .stream()
                .findFirst();
    }

    public TaskDto mapToDto(Task t) {
        TaskAssignment latestAssignment = assignmentRepository
                .findTopByTask_TaskIdOrderByAssignedAtDesc(t.getTaskId())
                .orElse(null);
        return mapToDto(t, latestAssignment);
    }

    private TaskDto mapToDto(Task t, TaskAssignment assignment) {
        String taskStatus = t.getStatus();
        if ("IN_PROGRESS".equals(taskStatus)
                && assignment != null
                && "ON_THE_WAY".equals(assignment.getStatus())) {
            taskStatus = "ON_THE_WAY";
        }
        ReportDto reportDto = t.getReport() != null ? mapReportToDto(t.getReport()) : null;
        UUID areaId = t.getArea() != null
                ? t.getArea().getAreaId()
                : reportDto != null ? reportDto.getAreaId() : null;
        String areaName = t.getArea() != null
                ? t.getArea().getName()
                : reportDto != null ? reportDto.getAreaName() : null;

        return TaskDto.builder()
                .taskId(t.getTaskId())
                .reportId(t.getReport() != null ? t.getReport().getReportId() : null)
                .enterpriseUserId(t.getEnterprise().getUserId())
                .enterpriseName(t.getEnterprise().getDisplayName())
                .createdByUserId(t.getCreatedBy().getUserId())
                .collectorUserId(assignment != null ? assignment.getCollector().getUserId() : null)
                .collectorName(assignment != null ? assignment.getCollector().getDisplayName() : null)
                .assignmentStatus(assignment != null ? assignment.getStatus() : null)
                .areaId(areaId)
                .areaName(areaName)
                .status(taskStatus)
                .priority(t.getPriority())
                .scheduledDate(t.getScheduledDate())
                .rejectionReason(t.getRejectionReason())
                .report(reportDto)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private ReportDto mapReportToDto(WasteReport report) {
        return ReportDto.builder()
                .reportId(report.getReportId())
                .reporterUserId(report.getReporter().getUserId())
                .reporterName(report.getReporter().getDisplayName())
                .wasteTypeId(report.getWasteType() != null ? report.getWasteType().getWasteTypeId() : null)
                .wasteTypeName(report.getWasteType() != null ? report.getWasteType().getName() : null)
                .areaId(report.getArea() != null ? report.getArea().getAreaId() : null)
                .areaName(report.getArea() != null ? report.getArea().getName() : null)
                .latitude(report.getLatitude())
                .longitude(report.getLongitude())
                .gpsAccuracyMeters(report.getGpsAccuracyMeters())
                .description(report.getDescription())
                .reportPhotoUrl(report.getReportPhotoUrl())
                .status(report.getStatus())
                .requestedPickupTime(report.getRequestedPickupTime())
                .createdAt(report.getCreatedAt())
                .build();
    }

    private String normalizeTaskFilterStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "ON_THE_WAY" -> "IN_PROGRESS";
            case "COLLECTED" -> "COMPLETED";
            default -> normalized;
        };
    }

    private void ensureEnterpriseCanHandleReport(WasteReport report, UUID enterpriseId) {
        if (report.getWasteType() == null) {
            throw new ForbiddenException("Report is missing waste type for capability matching");
        }

        boolean canHandle = capabilityRepository.findByEnterprise_UserId(enterpriseId).stream()
                .anyMatch(capability ->
                        capability.getWasteType() != null
                                && report.getWasteType().getWasteTypeId().equals(capability.getWasteType().getWasteTypeId()));
        if (!canHandle) {
            throw new ForbiddenException("Your enterprise does not have capability for this waste type");
        }
    }

    private PageResponse<TaskDto> toPageResponse(Page<Task> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
