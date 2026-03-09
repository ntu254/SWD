package demo.uc12.decorator;

import demo.common.Colors;
import demo.uc12.entity.Task;
import demo.uc12.entity.TaskAssignment;
import demo.uc12.service.TaskService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

/**
 * Concrete Decorator 1 (UC-12): Logs task creation and assignment operations.
 */
public class LoggingTaskServiceDecorator extends TaskServiceDecorator {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("HH:mm:ss");

    public LoggingTaskServiceDecorator(TaskService wrapped) {
        super(wrapped);
    }

    @Override
    public Task createTask(String enterprise, String area, String desc,
            LocalDate schedule, String priority) {
        log("[CREATE] Enterprise=" + enterprise + " | Area=" + area + " | Priority=" + priority);
        Task t = wrapped.createTask(enterprise, area, desc, schedule, priority);
        log("[CREATE] OK | Task=" + t.getTaskId().toString().substring(0, 8) + " | Status=" + t.getStatus());
        return t;
    }

    @Override
    public TaskAssignment assignTask(UUID taskId, UUID collectorId, String collectorName) {
        log("[ASSIGN] Task=" + taskId.toString().substring(0, 8) + " -> Collector=" + collectorName);
        TaskAssignment a = wrapped.assignTask(taskId, collectorId, collectorName);
        log("[ASSIGN] OK | Assignment=" + a.getAssignmentId().toString().substring(0, 8));
        return a;
    }

    @Override
    public TaskAssignment completeAssignment(UUID id) {
        log("[COMPLETE] Assignment=" + id.toString().substring(0, 8));
        TaskAssignment a = wrapped.completeAssignment(id);
        log("[COMPLETE] Done | Task status=" + a.getTask().getStatus());
        return a;
    }

    private void log(String msg) {
        System.out.println(Colors.purple("  [LOG " + LocalDateTime.now().format(FMT) + "] " + msg));
    }
}
