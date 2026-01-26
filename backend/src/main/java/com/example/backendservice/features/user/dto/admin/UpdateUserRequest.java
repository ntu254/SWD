package com.example.backendservice.features.user.dto.admin;

import jakarta.validation.constraints.Email;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateUserRequest {

    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstName;

    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;

    public UpdateUserRequest() {
    }

    public UpdateUserRequest(String firstName, String lastName, String email, String phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
    }

    public static UpdateUserRequestBuilder builder() {
        return new UpdateUserRequestBuilder();
    }

    public static class UpdateUserRequestBuilder {
        private String firstName;
        private String lastName;
        private String email;
        private String phone;

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

        public UpdateUserRequestBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UpdateUserRequest build() {
            return new UpdateUserRequest(firstName, lastName, email, phone);
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}
