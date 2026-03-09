package demo.uc12.config;

/**
 * Abstract Factory Interface (UC-12)
 * Factory family: TaskValidator + AssignmentRule
 *
 * StandardTaskConfigFactory : lenient rules for normal operations
 * StrictTaskConfigFactory : strict rules for high-risk environments
 */
public interface TaskConfigFactory {
    TaskValidator createTaskValidator();

    AssignmentRule createAssignmentRule();

    String getFactoryName();
}
