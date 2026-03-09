package demo.uc12.config;

/**
 * Abstract Product A (UC-12 Abstract Factory)
 * Validates a task before it is created.
 */
public interface TaskValidator {
    void validate(String enterpriseName, String areaName, String description, String priority);

    String describe();
}
