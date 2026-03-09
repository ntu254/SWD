package demo.uc12.entity;

/**
 * UC-12 Enum: TaskStatus
 * Pattern: State - Task transitions through states following business flow.
 */
public enum TaskStatus {
    PENDING,
    PENDING_ENTERPRISE_APPROVAL,
    ASSIGNED,
    IN_PROGRESS,
    COLLECTED,
    FAILED,
    CANCELLED,
    REJECTED
}
