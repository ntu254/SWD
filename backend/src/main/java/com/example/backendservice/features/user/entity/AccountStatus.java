package com.example.backendservice.features.user.entity;

/**
 * Account status enum for user management
 * Supports Facebook-style soft delete with 14-day retention period
 */
public enum AccountStatus {
    /**
     * User account is active and can access all features
     */
    ACTIVE,

    /**
     * User account is temporarily disabled by admin
     * Can be re-enabled by updating status to ACTIVE
     */
    DISABLED,

    /**
     * User account is banned due to policy violations
     * Requires admin review to restore
     */
    BANNED,

    /**
     * User account is scheduled for permanent deletion
     * Has 14-day grace period before hard delete
     * Cannot be modified - must be restored first
     */
    PENDING_DELETE
}
