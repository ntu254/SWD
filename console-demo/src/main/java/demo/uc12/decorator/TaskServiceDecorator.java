package demo.uc12.decorator;

import demo.uc12.entity.Task;
import demo.uc12.entity.TaskAssignment;
import demo.uc12.entity.TaskStatus;
import demo.uc12.service.TaskService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/** Abstract Decorator (UC-12): Wraps TaskService and delegates all calls. */
public abstract class TaskServiceDecorator implements TaskService {

    protected final TaskService wrapped;

    protected TaskServiceDecorator(TaskService wrapped) {
        this.wrapped = wrapped;
    }

    @Override
    public Task createTask(String e, String a, String d, LocalDate s, String p) {
        return wrapped.createTask(e, a, d, s, p);
    }

    @Override
    public TaskAssignment assignTask(UUID taskId, UUID collectorId, String name) {
        return wrapped.assignTask(taskId, collectorId, name);
    }

    @Override
    public TaskAssignment acceptAssignment(UUID id) {
        return wrapped.acceptAssignment(id);
    }

    @Override
    public TaskAssignment rejectAssignment(UUID id, String r) {
        return wrapped.rejectAssignment(id, r);
    }

    @Override
    public TaskAssignment completeAssignment(UUID id) {
        return wrapped.completeAssignment(id);
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus s) {
        return wrapped.getTasksByStatus(s);
    }

    @Override
    public List<Task> getAllTasks() {
        return wrapped.getAllTasks();
    }

    @Override
    public List<TaskAssignment> getAllAssignments() {
        return wrapped.getAllAssignments();
    }

    @Override
    public List<TaskAssignment> getAssignmentsByCollector(UUID id) {
        return wrapped.getAssignmentsByCollector(id);
    }
}
