package demo.uc12.config;

import demo.uc12.entity.Task;
import demo.uc12.entity.TaskStatus;

/**
 * Concrete Factory 2 (UC-12): Strict Rules
 * - TaskValidator : description >= 15 chars, priority must be HIGH or URGENT
 * - AssignmentRule: task must be PENDING and priority HIGH/URGENT
 */
public class StrictTaskConfigFactory implements TaskConfigFactory {

    @Override
    public TaskValidator createTaskValidator() {
        return new TaskValidator() {
            @Override
            public void validate(String enterprise, String area, String desc, String priority) {
                if (desc == null || desc.trim().length() < 15)
                    throw new IllegalArgumentException(
                            "[STRICT] Description must be at least 15 characters. Given: "
                                    + (desc == null ? 0 : desc.length()) + " chars");
                if (!"HIGH".equals(priority) && !"URGENT".equals(priority))
                    throw new IllegalArgumentException(
                            "[STRICT] Only HIGH or URGENT priority tasks allowed. Given: " + priority);
                if (area == null || area.isBlank())
                    throw new IllegalArgumentException("[STRICT] Area name is required");
            }

            @Override
            public String describe() {
                return "Strict: description >= 15 chars, priority must be HIGH or URGENT";
            }
        };
    }

    @Override
    public AssignmentRule createAssignmentRule() {
        return new AssignmentRule() {
            @Override
            public void validate(Task task) {
                if (task.getStatus() != TaskStatus.PENDING)
                    throw new IllegalStateException(
                            "Task must be PENDING. Current: " + task.getStatus());
                if (!"HIGH".equals(task.getPriority()) && !"URGENT".equals(task.getPriority()))
                    throw new IllegalStateException(
                            "[STRICT] Only HIGH/URGENT tasks can be assigned. Current priority: "
                                    + task.getPriority());
            }

            @Override
            public String describe() {
                return "Strict: only HIGH/URGENT PENDING tasks can be assigned";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Strict Task Config (HIGH/URGENT only)";
    }
}
