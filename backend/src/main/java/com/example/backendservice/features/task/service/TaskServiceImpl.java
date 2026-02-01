package com.example.backendservice.features.task.service;

import com.example.backendservice.features.enterprise.entity.Enterprise;
import com.example.backendservice.features.enterprise.repository.EnterpriseRepository;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.task.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.repository.TaskAssignmentRepository;
import com.example.backendservice.features.task.repository.TaskRepository;
import com.example.backendservice.features.user.entity.CollectorProfile;
import com.example.backendservice.features.user.repository.CollectorProfileRepository;
import com.example.backendservice.features.waste.entity.WasteType;
import com.example.backendservice.features.waste.repository.WasteTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository assignmentRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final WasteTypeRepository wasteTypeRepository;
    private final CollectorProfileRepository collectorProfileRepository;

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        log.info("Creating task for enterprise: {}", request.getEnterpriseId());

        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new EntityNotFoundException("Enterprise not found"));

        Task task = Task.builder()
                .enterprise(enterprise)
                .estimatedWeightKg(request.getEstimatedWeightKg())
                .locationText(request.getLocationText())
                .lat(request.getLat())
                .lng(request.getLng())
                .notes(request.getNotes())
                .priority(request.getPriority() != null ? request.getPriority() : "NORMAL")
                .scheduledAt(request.getScheduledAt())
                .status("PENDING")
                .build();

        if (request.getAreaId() != null) {
            ServiceArea area = serviceAreaRepository.findById(request.getAreaId()).orElse(null);
            task.setArea(area);
        }

        if (request.getWasteTypeId() != null) {
            WasteType wasteType = wasteTypeRepository.findById(request.getWasteTypeId()).orElse(null);
            task.setWasteType(wasteType);
        }

        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public TaskResponse getTaskById(UUID id) {
        Task task = findTaskById(id);
        return mapToResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByEnterprise(UUID enterpriseId, String status, Pageable pageable) {
        Page<Task> tasks;
        if (status != null && !status.isEmpty()) {
            tasks = taskRepository.findByEnterpriseIdAndStatus(enterpriseId, status, pageable);
        } else {
            tasks = taskRepository.findByEnterpriseId(enterpriseId, pageable);
        }
        return tasks.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasksByArea(UUID areaId, Pageable pageable) {
        return taskRepository.findByAreaId(areaId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID id, CreateTaskRequest request) {
        Task task = findTaskById(id);
        task.setEstimatedWeightKg(request.getEstimatedWeightKg());
        task.setLocationText(request.getLocationText());
        task.setLat(request.getLat());
        task.setLng(request.getLng());
        task.setNotes(request.getNotes());
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setScheduledAt(request.getScheduledAt());
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public void deleteTask(UUID id) {
        Task task = findTaskById(id);
        task.setStatus("CANCELLED");
        taskRepository.save(task);
    }

    @Override
    @Transactional
    public TaskResponse startTask(UUID taskId) {
        Task task = findTaskById(taskId);
        if (!"ASSIGNED".equals(task.getStatus())) {
            throw new IllegalStateException("Only ASSIGNED tasks can be started");
        }
        task.setStatus("IN_PROGRESS");
        task.setStartedAt(LocalDateTime.now());
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse completeTask(UUID taskId, Double actualWeightKg) {
        Task task = findTaskById(taskId);
        if (!"IN_PROGRESS".equals(task.getStatus())) {
            throw new IllegalStateException("Only IN_PROGRESS tasks can be completed");
        }
        task.setStatus("COMPLETED");
        task.setActualWeightKg(actualWeightKg);
        task.setCompletedAt(LocalDateTime.now());
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskResponse cancelTask(UUID taskId, String reason) {
        Task task = findTaskById(taskId);
        task.setStatus("CANCELLED");
        task.setNotes(task.getNotes() + " | Cancelled: " + reason);
        task = taskRepository.save(task);
        return mapToResponse(task);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse assignTask(AssignTaskRequest request) {
        log.info("Assigning task {} to collector {}", request.getTaskId(), request.getCollectorId());

        Task task = findTaskById(request.getTaskId());
        if (!"PENDING".equals(task.getStatus())) {
            throw new IllegalStateException("Only PENDING tasks can be assigned");
        }

        CollectorProfile collector = collectorProfileRepository.findById(request.getCollectorId())
                .orElseThrow(() -> new EntityNotFoundException("Collector not found"));

        TaskAssignment assignment = TaskAssignment.builder()
                .task(task)
                .collector(collector)
                .status("ASSIGNED")
                .notes(request.getNotes())
                .assignedAt(LocalDateTime.now())
                .build();

        assignment = assignmentRepository.save(assignment);

        task.setStatus("ASSIGNED");
        taskRepository.save(task);

        return mapToAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse acceptAssignment(UUID assignmentId) {
        TaskAssignment assignment = findAssignmentById(assignmentId);
        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Only ASSIGNED assignments can be accepted");
        }
        assignment.setStatus("ACCEPTED");
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment = assignmentRepository.save(assignment);
        return mapToAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse rejectAssignment(UUID assignmentId, String reason) {
        TaskAssignment assignment = findAssignmentById(assignmentId);
        assignment.setStatus("REJECTED");
        assignment.setRejectionReason(reason);
        assignment = assignmentRepository.save(assignment);

        // Reset task status to PENDING
        Task task = assignment.getTask();
        task.setStatus("PENDING");
        taskRepository.save(task);

        return mapToAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse completeAssignment(UUID assignmentId, Double collectedWeightKg,
            String evidenceImages) {
        TaskAssignment assignment = findAssignmentById(assignmentId);
        assignment.setStatus("COMPLETED");
        assignment.setCollectedWeightKg(collectedWeightKg);
        assignment.setEvidenceImages(evidenceImages);
        assignment.setCompletedAt(LocalDateTime.now());
        assignment = assignmentRepository.save(assignment);
        return mapToAssignmentResponse(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TaskAssignmentResponse> getAssignmentsByCollector(UUID collectorId, String status, Pageable pageable) {
        Page<TaskAssignment> assignments;
        if (status != null && !status.isEmpty()) {
            assignments = assignmentRepository.findByCollectorIdAndStatus(collectorId, status, pageable);
        } else {
            assignments = assignmentRepository.findByCollectorId(collectorId, pageable);
        }
        return assignments.map(this::mapToAssignmentResponse);
    }

    private Task findTaskById(UUID id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id: " + id));
    }

    private TaskAssignment findAssignmentById(UUID id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found with id: " + id));
    }

    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .wasteReportId(task.getWasteReport() != null ? task.getWasteReport().getId() : null)
                .enterpriseId(task.getEnterprise().getId())
                .enterpriseName(task.getEnterprise().getName())
                .areaId(task.getArea() != null ? task.getArea().getId() : null)
                .areaName(task.getArea() != null ? task.getArea().getName() : null)
                .wasteTypeId(task.getWasteType() != null ? task.getWasteType().getId() : null)
                .wasteTypeName(task.getWasteType() != null ? task.getWasteType().getName() : null)
                .estimatedWeightKg(task.getEstimatedWeightKg())
                .actualWeightKg(task.getActualWeightKg())
                .locationText(task.getLocationText())
                .lat(task.getLat())
                .lng(task.getLng())
                .notes(task.getNotes())
                .status(task.getStatus())
                .priority(task.getPriority())
                .scheduledAt(task.getScheduledAt())
                .startedAt(task.getStartedAt())
                .completedAt(task.getCompletedAt())
                .pointsAwarded(task.getPointsAwarded())
                .createdAt(task.getCreatedAt())
                .build();
    }

    private TaskAssignmentResponse mapToAssignmentResponse(TaskAssignment assignment) {
        return TaskAssignmentResponse.builder()
                .id(assignment.getId())
                .taskId(assignment.getTask().getId())
                .collectorId(assignment.getCollector().getId())
                .collectorName(
                        assignment.getCollector() != null ? assignment.getCollector().getFullName()
                                : null)
                .status(assignment.getStatus())
                .rejectionReason(assignment.getRejectionReason())
                .evidenceImages(assignment.getEvidenceImages())
                .collectedWeightKg(assignment.getCollectedWeightKg())
                .notes(assignment.getNotes())
                .assignedAt(assignment.getAssignedAt())
                .acceptedAt(assignment.getAcceptedAt())
                .startedAt(assignment.getStartedAt())
                .completedAt(assignment.getCompletedAt())
                .build();
    }
}
