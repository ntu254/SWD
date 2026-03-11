package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRoleRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ENTERPRISE|CITIZEN)$", message = "Role must be either ENTERPRISE or CITIZEN")
    private String role;
}
