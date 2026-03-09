package demo.uc12.entity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * UC-12 Entity: TaskAssignment
 * Records the assignment of a task to a collector.
 * Pattern: Template Method - assignedAt is set automatically on construction.
 */
public class TaskAssignment {

    private UUID assignmentId;
    private Task task;
    private String collectorName;
    private UUID collectorUserId;
    private LocalDateTime assignedAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime completedAt;
    private TaskAssignmentStatus status;
    private String collectorNote;

    public TaskAssignment(Task task, UUID collectorUserId, String collectorName) {
        this.assignmentId = UUID.randomUUID();
        this.task = task;
        this.collectorUserId = collectorUserId;
        this.collectorName = collectorName;
        this.status = TaskAssignmentStatus.ASSIGNED;
        this.assignedAt = LocalDateTime.now(); // auto-set (Template Method)
    }

    public void accept() {
        if (this.status != TaskAssignmentStatus.ASSIGNED)
            throw new IllegalStateException("Can only accept when status is ASSIGNED");
        this.status = TaskAssignmentStatus.ON_THE_WAY;
        this.acceptedAt = LocalDateTime.now();
        this.task.setStatus(TaskStatus.IN_PROGRESS);
    }

    public void reject(String note) {
        if (this.status != TaskAssignmentStatus.ASSIGNED)
            throw new IllegalStateException("Can only reject when status is ASSIGNED");
        this.status = TaskAssignmentStatus.CANCELLED;
        this.collectorNote = note;
        this.task.setStatus(TaskStatus.PENDING);
    }

    public void complete() {
        if (this.status != TaskAssignmentStatus.ON_THE_WAY)
            throw new IllegalStateException("Can only complete when status is ON_THE_WAY");
        this.status = TaskAssignmentStatus.COLLECTED;
        this.completedAt = LocalDateTime.now();
        this.task.setStatus(TaskStatus.COLLECTED);
    }

    public UUID getAssignmentId() {
        return assignmentId;
    }

    public Task getTask() {
        return task;
    }

    public String getCollectorName() {
        return collectorName;
    }

    public UUID getCollectorUserId() {
        return collectorUserId;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public LocalDateTime getAcceptedAt() {
        return acceptedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public TaskAssignmentStatus getStatus() {
        return status;
    }

    public String getCollectorNote() {
        return collectorNote;
    }
}
