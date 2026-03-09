package demo.uc12.decorator;

import demo.common.Colors;
import demo.uc12.entity.Task;
import demo.uc12.entity.TaskAssignment;
import demo.uc12.service.TaskService;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Concrete Decorator 2 (UC-12): Records audit trail of all task state changes.
 */
public class AuditTaskServiceDecorator extends TaskServiceDecorator {

    private final List<String> auditLog = new ArrayList<>();

    public AuditTaskServiceDecorator(TaskService wrapped) {
        super(wrapped);
    }

    @Override
    public Task createTask(String e, String a, String d, LocalDate s, String p) {
        Task t = wrapped.createTask(e, a, d, s, p);
        audit("TASK_CREATED", t.getTaskId().toString().substring(0, 8) + " [" + p + "] " + e);
        return t;
    }

    @Override
    public TaskAssignment assignTask(UUID taskId, UUID collectorId, String collectorName) {
        TaskAssignment a = wrapped.assignTask(taskId, collectorId, collectorName);
        audit("TASK_ASSIGNED", "Task=" + taskId.toString().substring(0, 8) + " -> " + collectorName);
        return a;
    }

    @Override
    public TaskAssignment acceptAssignment(UUID id) {
        TaskAssignment a = wrapped.acceptAssignment(id);
        audit("ASSIGNMENT_ACCEPTED", id.toString().substring(0, 8));
        return a;
    }

    @Override
    public TaskAssignment rejectAssignment(UUID id, String reason) {
        TaskAssignment a = wrapped.rejectAssignment(id, reason);
        audit("ASSIGNMENT_REJECTED", id.toString().substring(0, 8) + " reason=" + reason);
        return a;
    }

    @Override
    public TaskAssignment completeAssignment(UUID id) {
        TaskAssignment a = wrapped.completeAssignment(id);
        audit("TASK_COMPLETED", id.toString().substring(0, 8));
        return a;
    }

    public void printAuditLog() {
        System.out.println();
        System.out.println(Colors.yellow("  -- AUDIT TRAIL (" + auditLog.size() + " records) --"));
        if (auditLog.isEmpty())
            System.out.println("  (no records)");
        else
            auditLog.forEach(e -> System.out.println(Colors.yellow("  " + e)));
    }

    private void audit(String event, String detail) {
        auditLog.add(String.format("[%-22s] %s", event, detail));
    }
}
