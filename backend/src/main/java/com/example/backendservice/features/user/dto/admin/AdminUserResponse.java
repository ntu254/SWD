package com.example.backendservice.features.user.dto.admin;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AdminUserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private String userCode;
    private String role;
    private String accountStatus;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private LocalDateTime deleteScheduledAt;
    private String banReason;

    public AdminUserResponse() {
    }

    public AdminUserResponse(UUID id, String firstName, String lastName, String fullName, String email, String phone,
            String userCode, String role, String accountStatus, boolean enabled, LocalDateTime createdAt,
            LocalDateTime updatedAt, LocalDateTime deletedAt, LocalDateTime deleteScheduledAt, String banReason) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.userCode = userCode;
        this.role = role;
        this.accountStatus = accountStatus;
        this.enabled = enabled;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.deleteScheduledAt = deleteScheduledAt;
        this.banReason = banReason;
    }

    public static AdminUserResponseBuilder builder() {
        return new AdminUserResponseBuilder();
    }

    public static class AdminUserResponseBuilder {
        private UUID id;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private String userCode;
        private String role;
        private String accountStatus;
        private boolean enabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime deletedAt;
        private LocalDateTime deleteScheduledAt;
        private String banReason;

        AdminUserResponseBuilder() {
        }

        public AdminUserResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public AdminUserResponseBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public AdminUserResponseBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public AdminUserResponseBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public AdminUserResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AdminUserResponseBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public AdminUserResponseBuilder userCode(String userCode) {
            this.userCode = userCode;
            return this;
        }

        public AdminUserResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AdminUserResponseBuilder accountStatus(String accountStatus) {
            this.accountStatus = accountStatus;
            return this;
        }

        public AdminUserResponseBuilder enabled(boolean enabled) {
            this.enabled = enabled;
            return this;
        }

        public AdminUserResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AdminUserResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public AdminUserResponseBuilder deletedAt(LocalDateTime deletedAt) {
            this.deletedAt = deletedAt;
            return this;
        }

        public AdminUserResponseBuilder deleteScheduledAt(LocalDateTime deleteScheduledAt) {
            this.deleteScheduledAt = deleteScheduledAt;
            return this;
        }

        public AdminUserResponseBuilder banReason(String banReason) {
            this.banReason = banReason;
            return this;
        }

        public AdminUserResponse build() {
            return new AdminUserResponse(id, firstName, lastName, fullName, email, phone, userCode, role, accountStatus,
                    enabled, createdAt, updatedAt, deletedAt, deleteScheduledAt, banReason);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(String accountStatus) {
        this.accountStatus = accountStatus;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public LocalDateTime getDeleteScheduledAt() {
        return deleteScheduledAt;
    }

    public void setDeleteScheduledAt(LocalDateTime deleteScheduledAt) {
        this.deleteScheduledAt = deleteScheduledAt;
    }

    public String getBanReason() {
        return banReason;
    }

    public void setBanReason(String banReason) {
        this.banReason = banReason;
    }
}
