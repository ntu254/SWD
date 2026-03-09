package demo.uc05.config;

/**
 * Abstract Product A (Abstract Factory)
 * Defines how base points are multiplied when a citizen earns points.
 */
public interface PointMultiplier {
    /** Apply multiplier to base points and return final points. */
    int apply(int basePoints);

    /** Human-readable description of this multiplier. */
    String describe();
}
