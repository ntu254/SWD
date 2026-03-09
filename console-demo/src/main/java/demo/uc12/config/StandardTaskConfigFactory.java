package demo.uc12.config;

import demo.uc12.entity.Task;
import demo.uc12.entity.TaskStatus;

/**
 * Concrete Factory 1 (UC-12): Standard Rules
 * - TaskValidator : description >= 5 chars, any priority OK
 * - AssignmentRule: task must be PENDING
 */
public class StandardTaskConfigFactory implements TaskConfigFactory {

    @Override
    public TaskValidator createTaskValidator() {
        return new TaskValidator() {
            @Override
            public void validate(String enterprise, String area, String desc, String priority) {
                if (desc == null || desc.trim().length() < 5)
                    throw new IllegalArgumentException(
                            "Task description must be at least 5 characters");
                if (enterprise == null || enterprise.isBlank())
                    throw new IllegalArgumentException("Enterprise name is required");
            }

            @Override
            public String describe() {
                return "Standard: description >= 5 chars, any priority allowed";
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
                            "Task must be PENDING to assign. Current: " + task.getStatus());
            }

            @Override
            public String describe() {
                return "Standard: any PENDING task can be assigned, any collector eligible";
            }
        };
    }

    @Override
    public String getFactoryName() {
        return "Standard Task Config";
    }
}
