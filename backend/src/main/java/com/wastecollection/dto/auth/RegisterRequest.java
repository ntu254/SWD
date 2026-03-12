package com.wastecollection.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String phone;
    private String displayName;

    /**
     * Role to register as: CITIZEN, COLLECTOR, ENTERPRISE
     * (ADMIN role cannot be self-registered)
     */
    @NotBlank(message = "Role is required")
    private String role;

    /**
     * Required when role = COLLECTOR — the enterprise's user_id this collector belongs to.
     */
    private String enterpriseUserId;
}
