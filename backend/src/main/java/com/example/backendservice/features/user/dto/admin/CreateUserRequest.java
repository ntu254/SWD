package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CreateUserRequest {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Role is required")
    @Pattern(regexp = "^(ENTERPRISE|CITIZEN)$", message = "Role must be either ENTERPRISE or CITIZEN")
    private String role;

    @NotBlank(message = "Phone is required")
    private String phone;

    public CreateUserRequest() {
    }

    public CreateUserRequest(String firstName, String lastName, String email, String password, String role,
            String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.phone = phone;
    }

    public static CreateUserRequestBuilder builder() {
        return new CreateUserRequestBuilder();
    }

    public static class CreateUserRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String role;
        private String phone;

        CreateUserRequestBuilder() {
        }

        public CreateUserRequestBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public CreateUserRequestBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public CreateUserRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public CreateUserRequestBuilder password(String password) {
            this.password = password;
            return this;
        }

        public CreateUserRequestBuilder role(String role) {
            this.role = role;
            return this;
        }

        public CreateUserRequestBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public CreateUserRequest build() {
            return new CreateUserRequest(firstName, lastName, email, password, role, phone);
        }
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
