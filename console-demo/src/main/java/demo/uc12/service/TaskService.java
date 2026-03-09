package demo.uc12.service;

import demo.uc12.entity.Task;
import demo.uc12.entity.TaskAssignment;
import demo.uc12.entity.TaskStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * UC-12 Service Interface
 * Pattern: Strategy
 */
public interface TaskService {
    Task createTask(String enterpriseName, String areaName, String description,
            LocalDate scheduledDate, String priority);

    TaskAssignment assignTask(UUID taskId, UUID collectorUserId, String collectorName);

    TaskAssignment acceptAssignment(UUID assignmentId);

    TaskAssignment rejectAssignment(UUID assignmentId, String note);

    TaskAssignment completeAssignment(UUID assignmentId);

    List<Task> getTasksByStatus(TaskStatus status);

    List<Task> getAllTasks();

    List<TaskAssignment> getAllAssignments();

    List<TaskAssignment> getAssignmentsByCollector(UUID collectorUserId);
}
