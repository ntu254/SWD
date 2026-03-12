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
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final CollectionVisitRepository visitRepository;
    private final EvidencePhotoRepository photoRepository;
    private final VisitWasteItemRepository wasteItemRepository;
    private final WasteReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ServiceAreaRepository serviceAreaRepository;
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
        Page<Task> tasks = status != null
                ? taskRepository.findByEnterprise_UserIdAndStatus(enterpriseId, status, pageable)
                : taskRepository.findByEnterprise_UserId(enterpriseId, pageable);
        return toPageResponse(tasks);
    }

    @Transactional(readOnly = true)
    public PageResponse<TaskDto> getTasksForCollector(UUID collectorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("assignedAt").descending());
        Page<TaskAssignment> assignments = assignmentRepository.findByCollector_UserId(collectorId, pageable);
        List<TaskDto> dtos = assignments.getContent().stream()
                .map(a -> mapToDto(a.getTask()))
                .toList();
        return new PageResponse<>(dtos, assignments.getNumber(), assignments.getSize(),
                assignments.getTotalElements(), assignments.getTotalPages(), assignments.isLast());
    }

    @Transactional
    public TaskDto updateAssignmentStatus(UUID taskId, UUID collectorId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        TaskAssignment assignment = assignmentRepository
                .findByTask_TaskIdAndStatusIn(taskId, List.of("ASSIGNED", "ACCEPTED", "ON_THE_WAY"))
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "taskId", taskId));

        if (!assignment.getCollector().getUserId().equals(collectorId)) {
            throw new ForbiddenException("This task is not assigned to you");
        }

        assignment.setStatus(newStatus);
        assignmentRepository.save(assignment);
        task.setStatus("IN_PROGRESS");
        taskRepository.save(task);

        return mapToDto(task);
    }

    @Transactional
    public TaskDto completeVisit(UUID taskId, UUID collectorId, CompleteVisitRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        TaskAssignment assignment = assignmentRepository
                .findByTask_TaskIdAndStatusIn(taskId, List.of("ASSIGNED", "ACCEPTED", "ON_THE_WAY", "IN_PROGRESS"))
                .orElseThrow(() -> new ResourceNotFoundException("TaskAssignment", "taskId", taskId));

        if (!assignment.getCollector().getUserId().equals(collectorId)) {
            throw new ForbiddenException("This task is not assigned to you");
        }

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
    public TaskDto getTask(UUID taskId) {
        return mapToDto(taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId)));
    }

    @Transactional(readOnly = true)
    public com.wastecollection.dto.enterprise.KpiConfigDto getTodayKpi(UUID collectorId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        CollectorKpiDaily kpi = kpiRepository
                .findByCollector_UserIdAndKpiDate(collectorId, today)
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
            CollectorKpiDaily kpi = kpiRepository
                    .findByCollector_UserIdAndKpiDate(collectorId, today)
                    .orElse(null);
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

    public TaskDto mapToDto(Task t) {
        return TaskDto.builder()
                .taskId(t.getTaskId())
                .reportId(t.getReport() != null ? t.getReport().getReportId() : null)
                .enterpriseUserId(t.getEnterprise().getUserId())
                .enterpriseName(t.getEnterprise().getDisplayName())
                .createdByUserId(t.getCreatedBy().getUserId())
                .areaId(t.getArea() != null ? t.getArea().getAreaId() : null)
                .areaName(t.getArea() != null ? t.getArea().getName() : null)
                .status(t.getStatus())
                .priority(t.getPriority())
                .scheduledDate(t.getScheduledDate())
                .rejectionReason(t.getRejectionReason())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }

    private PageResponse<TaskDto> toPageResponse(Page<Task> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::mapToDto).toList(),
                page.getNumber(), page.getSize(),
                page.getTotalElements(), page.getTotalPages(), page.isLast());
    }
}
