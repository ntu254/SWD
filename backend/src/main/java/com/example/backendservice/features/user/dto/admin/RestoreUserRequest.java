package com.example.backendservice.features.user.dto.admin;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Empty request body for user restoration endpoint
 * Represents intent to restore a PENDING_DELETE user back to ACTIVE status
 */
@Data
@NoArgsConstructor
public class RestoreUserRequest {
    // Intentionally empty - endpoint requires POST body but no parameters needed
    // Restoration always sets accountStatus to ACTIVE
}
