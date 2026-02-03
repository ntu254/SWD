package com.example.backendservice.features.task.service;

import com.example.backendservice.common.exception.ResourceNotFoundException;
import com.example.backendservice.features.location.entity.ServiceArea;
import com.example.backendservice.features.location.repository.ServiceAreaRepository;
import com.example.backendservice.features.task.dto.*;
import com.example.backendservice.features.task.entity.Task;
import com.example.backendservice.features.task.entity.TaskAssignment;
import com.example.backendservice.features.task.repository.TaskAssignmentRepository;
import com.example.backendservice.features.task.repository.TaskRepository;
import com.example.backendservice.features.user.entity.RoleType;
import com.example.backendservice.features.user.entity.User;
import com.example.backendservice.features.user.repository.UserRepository;
import com.example.backendservice.features.waste.entity.WasteReport;
import com.example.backendservice.features.waste.repository.WasteReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final TaskAssignmentRepository taskAssignmentRepository;
    private final WasteReportRepository wasteReportRepository;
    private final ServiceAreaRepository serviceAreaRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        WasteReport report = wasteReportRepository.findByReportId(request.getReportId())
                .orElseThrow(() -> new ResourceNotFoundException("Waste report not found: " + request.getReportId()));

        ServiceArea area = serviceAreaRepository.findByAreaId(request.getAreaId())
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found: " + request.getAreaId()));

        // Get a default enterprise user (first active one, should be configurable)
        User enterpriseUser = userRepository.findByRole(RoleType.ENTERPRISE).stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No enterprise user found"));

        Task task = Task.builder()
                .wasteReport(report)
                .area(area)
                .enterpriseUser(enterpriseUser)
                .createdByUser(enterpriseUser)
                .scheduledDate(request.getScheduledDate())
                .status("PENDING")
                .priority("NORMAL")
                .build();

        task = taskRepository.save(task);

        // Update report status
        report.setStatus("ASSIGNED_TO_TASK");
        wasteReportRepository.save(report);

        log.info("Created task {} for report {}", task.getTaskId(), request.getReportId());
        return toTaskResponse(task);
    }

    @Override
    public TaskResponse getTaskById(UUID taskId) {
        Task task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        return toTaskResponse(task);
    }

    @Override
    public Page<TaskResponse> getTasksByArea(UUID areaId, Pageable pageable) {
        List<Task> tasks = taskRepository.findByAreaId(areaId);
        List<TaskResponse> responses = tasks.stream().map(this::toTaskResponse).collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<TaskResponse> getTasksByStatus(String status, Pageable pageable) {
        List<Task> tasks = taskRepository.findByStatus(status);
        List<TaskResponse> responses = tasks.stream().map(this::toTaskResponse).collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<TaskResponse> getTasksByScheduledDate(LocalDate date, Pageable pageable) {
        List<Task> tasks = taskRepository.findByScheduledDate(date);
        List<TaskResponse> responses = tasks.stream().map(this::toTaskResponse).collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<TaskResponse> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(this::toTaskResponse);
    }

    @Override
    @Transactional
    public TaskResponse updateTaskStatus(UUID taskId, String status) {
        Task task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        task.setStatus(status);
        task = taskRepository.save(task);
        log.info("Updated task {} status to {}", taskId, status);

        return toTaskResponse(task);
    }

    @Override
    @Transactional
    public void cancelTask(UUID taskId) {
        Task task = taskRepository.findByTaskId(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        task.setStatus("CANCELLED");
        taskRepository.save(task);
        log.info("Cancelled task {}", taskId);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse assignTask(AssignTaskRequest request) {
        Task task = taskRepository.findByTaskId(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + request.getTaskId()));

        User collector = userRepository.findByUserId(request.getCollectorUserId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Collector not found: " + request.getCollectorUserId()));

        TaskAssignment assignment = TaskAssignment.builder()
                .task(task)
                .collectorUser(collector)
                .status("ASSIGNED")
                .build();

        assignment = taskAssignmentRepository.save(assignment);

        // Update task status
        task.setStatus("ASSIGNED");
        taskRepository.save(task);

        log.info("Assigned task {} to collector {}", request.getTaskId(), request.getCollectorUserId());
        return toAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse acceptAssignment(UUID assignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Assignment is not in ASSIGNED status");
        }

        assignment.setStatus("ACCEPTED");
        assignment.setAcceptedAt(LocalDateTime.now());
        assignment = taskAssignmentRepository.save(assignment);

        // Update task status
        Task task = assignment.getTask();
        task.setStatus("IN_PROGRESS");
        taskRepository.save(task);

        log.info("Assignment {} accepted by collector {}", assignmentId, assignment.getCollectorUserId());
        return toAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse rejectAssignment(UUID assignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        if (!"ASSIGNED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Assignment is not in ASSIGNED status");
        }

        assignment.setStatus("REJECTED");
        assignment.setUnassignedAt(LocalDateTime.now());
        assignment = taskAssignmentRepository.save(assignment);

        // Update task status back to PENDING if no other active assignments
        Task task = assignment.getTask();
        List<TaskAssignment> activeAssignments = taskAssignmentRepository.findActiveAssignmentsByCollectorUserId(
                assignment.getCollectorUserId());
        boolean hasOtherActiveForTask = activeAssignments.stream()
                .anyMatch(a -> a.getTaskId().equals(task.getTaskId()) && !a.getAssignmentId().equals(assignmentId));

        if (!hasOtherActiveForTask) {
            task.setStatus("PENDING");
            taskRepository.save(task);
        }

        log.info("Assignment {} rejected by collector {}", assignmentId, assignment.getCollectorUserId());
        return toAssignmentResponse(assignment);
    }

    @Override
    @Transactional
    public TaskAssignmentResponse completeAssignment(UUID assignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));

        if (!"ACCEPTED".equals(assignment.getStatus())) {
            throw new IllegalStateException("Assignment is not in ACCEPTED status");
        }

        assignment.setStatus("COMPLETED");
        assignment = taskAssignmentRepository.save(assignment);

        // Update task status
        Task task = assignment.getTask();
        task.setStatus("COMPLETED");
        taskRepository.save(task);

        // Update report status if exists
        WasteReport report = task.getWasteReport();
        if (report != null) {
            report.setStatus("COMPLETED");
            wasteReportRepository.save(report);
        }

        log.info("Assignment {} completed by collector {}", assignmentId, assignment.getCollectorUserId());
        return toAssignmentResponse(assignment);
    }

    @Override
    public TaskAssignmentResponse getAssignmentById(UUID assignmentId) {
        TaskAssignment assignment = taskAssignmentRepository.findByAssignmentId(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + assignmentId));
        return toAssignmentResponse(assignment);
    }

    @Override
    public List<TaskAssignmentResponse> getAssignmentsByTask(UUID taskId) {
        return taskAssignmentRepository.findByTaskId(taskId).stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TaskAssignmentResponse> getAssignmentsByCollector(UUID collectorUserId, Pageable pageable) {
        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserId(collectorUserId);
        List<TaskAssignmentResponse> responses = assignments.stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    @Override
    public Page<TaskAssignmentResponse> getPendingAssignmentsByCollector(UUID collectorUserId, Pageable pageable) {
        List<TaskAssignment> assignments = taskAssignmentRepository.findByCollectorUserIdAndStatus(collectorUserId,
                "ASSIGNED");
        List<TaskAssignmentResponse> responses = assignments.stream()
                .map(this::toAssignmentResponse)
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), responses.size());

        return new PageImpl<>(responses.subList(start, end), pageable, responses.size());
    }

    // Mapping methods
    private TaskResponse toTaskResponse(Task task) {
        return TaskResponse.builder()
                .taskId(task.getTaskId())
                .reportId(task.getReportId())
                .areaId(task.getArea() != null ? task.getArea().getAreaId() : null)
                .areaName(task.getArea() != null ? task.getArea().getName() : null)
                .scheduledDate(task.getScheduledDate())
                .status(task.getStatus())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    private TaskAssignmentResponse toAssignmentResponse(TaskAssignment assignment) {
        return TaskAssignmentResponse.builder()
                .assignmentId(assignment.getAssignmentId())
                .taskId(assignment.getTaskId())
                .collectorUserId(assignment.getCollectorUserId())
                .collectorName(
                        assignment.getCollectorUser() != null ? assignment.getCollectorUser().getFullName() : null)
                .status(assignment.getStatus())
                .assignedAt(null)
                .acceptedAt(assignment.getAcceptedAt())
                .completedAt(null)
                .build();
    }
}
