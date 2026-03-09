package demo.uc12.config;

import demo.uc12.entity.Task;

/**
 * Abstract Product B (UC-12 Abstract Factory)
 * Validates whether a task can be assigned to a collector.
 */
public interface AssignmentRule {
    void validate(Task task);

    String describe();
}
