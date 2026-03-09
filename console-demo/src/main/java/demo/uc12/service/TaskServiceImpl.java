package demo.uc12.service;

import demo.uc12.config.StandardTaskConfigFactory;
import demo.uc12.config.TaskConfigFactory;
import demo.uc12.config.TaskValidator;
import demo.uc12.config.AssignmentRule;
import demo.uc12.entity.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * UC-12 Service Implementation
 * Patterns: Strategy, Repository (in-memory), Abstract Factory
 * (TaskConfigFactory)
 *
 * TaskConfigFactory provides:
 * - TaskValidator : validates task data before creation
 * - AssignmentRule : validates eligibility before assignment
 */
public class TaskServiceImpl implements TaskService {

    private final Map<UUID, Task> tasks = new LinkedHashMap<>();
    private final Map<UUID, TaskAssignment> assignments = new LinkedHashMap<>();
    private final TaskValidator validator; // Abstract Factory Product A
    private final AssignmentRule assignmentRule; // Abstract Factory Product B

    /** Default constructor: uses StandardTaskConfigFactory. */
    public TaskServiceImpl() {
        this(new StandardTaskConfigFactory());
    }

    /** Parameterized constructor: Abstract Factory injects the products. */
    public TaskServiceImpl(TaskConfigFactory factory) {
        this.validator = factory.createTaskValidator();
        this.assignmentRule = factory.createAssignmentRule();
    }

    public TaskValidator getValidator() {
        return validator;
    }

    public AssignmentRule getAssignmentRule() {
        return assignmentRule;
    }

    @Override
    public Task createTask(String enterpriseName, String areaName, String description,
            LocalDate scheduledDate, String priority) {
        // Abstract Factory Product A: validate before creation
        validator.validate(enterpriseName, areaName, description, priority);
        Task task = new Task(enterpriseName, areaName, description, scheduledDate, priority);
        tasks.put(task.getTaskId(), task);
        return task;
    }

    @Override
    public TaskAssignment assignTask(UUID taskId, UUID collectorUserId, String collectorName) {
        Task task = findTask(taskId);
        // Abstract Factory Product B: validate before assignment
        assignmentRule.validate(task);
        TaskAssignment assignment = new TaskAssignment(task, collectorUserId, collectorName);
        task.setStatus(TaskStatus.ASSIGNED);
        assignments.put(assignment.getAssignmentId(), assignment);
        return assignment;
    }

    @Override
    public TaskAssignment acceptAssignment(UUID id) {
        TaskAssignment a = findAssignment(id);
        a.accept();
        return a;
    }

    @Override
    public TaskAssignment rejectAssignment(UUID id, String note) {
        TaskAssignment a = findAssignment(id);
        a.reject(note);
        return a;
    }

    @Override
    public TaskAssignment completeAssignment(UUID id) {
        TaskAssignment a = findAssignment(id);
        a.complete();
        return a;
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus status) {
        return tasks.values().stream().filter(t -> t.getStatus() == status).collect(Collectors.toList());
    }

    @Override
    public List<Task> getAllTasks() {
        return new ArrayList<>(tasks.values());
    }

    @Override
    public List<TaskAssignment> getAllAssignments() {
        return new ArrayList<>(assignments.values());
    }

    @Override
    public List<TaskAssignment> getAssignmentsByCollector(UUID id) {
        return assignments.values().stream()
                .filter(a -> a.getCollectorUserId().equals(id)).collect(Collectors.toList());
    }

    private Task findTask(UUID id) {
        Task t = tasks.get(id);
        if (t == null)
            throw new NoSuchElementException("Task not found: " + id);
        return t;
    }

    private TaskAssignment findAssignment(UUID id) {
        TaskAssignment a = assignments.get(id);
        if (a == null)
            throw new NoSuchElementException("Assignment not found: " + id);
        return a;
    }
}
