package com.example.backendservice.features.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateUserRequest {

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Email(message = "Email should be valid")
    private String email;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String firstName, String lastName, String email) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
    }

    public static UpdateUserRequestBuilder builder() {
        return new UpdateUserRequestBuilder();
    }

    public static class UpdateUserRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;

        UpdateUserRequestBuilder() {
        }

        public UpdateUserRequestBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UpdateUserRequestBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UpdateUserRequestBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UpdateUserRequest build() {
            return new UpdateUserRequest(firstName, lastName, email);
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
}
