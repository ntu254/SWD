package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateUserRoleRequest {

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ENTERPRISE|CITIZEN)$", message = "Role must be either ENTERPRISE or CITIZEN")
    private String role;

    public UpdateUserRoleRequest() {
    }

    public UpdateUserRoleRequest(String role) {
        this.role = role;
    }

    public static UpdateUserRoleRequestBuilder builder() {
        return new UpdateUserRoleRequestBuilder();
    }

    public static class UpdateUserRoleRequestBuilder {
        private String role;

        UpdateUserRoleRequestBuilder() {
        }

        public UpdateUserRoleRequestBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UpdateUserRoleRequest build() {
            return new UpdateUserRoleRequest(role);
        }
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
