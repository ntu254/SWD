package com.example.backendservice.features.user.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // Legacy role field
    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean enabled = true;

    // === NEW FIELDS theo APP_USER schema ===

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    // Multi-role support
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private Set<UserRole> roles = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime deletedAt;

    @Column(nullable = false, unique = true)
    private String userCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    private LocalDateTime deleteScheduledAt;

    @Column(length = 500)
    private String banReason;

    public User() {
    }

    public User(UUID id, String firstName, String lastName, String email, String password, String role, boolean enabled,
            String avatarUrl, String phone, LocalDateTime lastLoginAt, Set<UserRole> roles, LocalDateTime createdAt,
            LocalDateTime updatedAt, LocalDateTime deletedAt, String userCode, AccountStatus accountStatus,
            LocalDateTime deleteScheduledAt, String banReason) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.role = role;
        this.enabled = enabled;
        this.avatarUrl = avatarUrl;
        this.phone = phone;
        this.lastLoginAt = lastLoginAt;
        this.roles = roles != null ? roles : new HashSet<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
        this.userCode = userCode;
        this.accountStatus = accountStatus != null ? accountStatus : AccountStatus.ACTIVE;
        this.deleteScheduledAt = deleteScheduledAt;
        this.banReason = banReason;
    }

    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String role;
        private boolean enabled = true;
        private String avatarUrl;
        private String phone;
        private LocalDateTime lastLoginAt;
        private Set<UserRole> roles = new HashSet<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime deletedAt;
        private String userCode;
        private AccountStatus accountStatus = AccountStatus.ACTIVE;
        private LocalDateTime deleteScheduledAt;
        private String banReason;

        UserBuilder() {
        }

        public UserBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public UserBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public UserBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public UserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder role(String role) {
            this.role = role;
            return this;
        }

        public UserBuilder enabled(boolean enabled) {
            this.enabled = enabled;
            return this;
        }

        public UserBuilder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public UserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public UserBuilder lastLoginAt(LocalDateTime lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }

        public UserBuilder roles(Set<UserRole> roles) {
            this.roles = roles;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public UserBuilder deletedAt(LocalDateTime deletedAt) {
            this.deletedAt = deletedAt;
            return this;
        }

        public UserBuilder userCode(String userCode) {
            this.userCode = userCode;
            return this;
        }

        public UserBuilder accountStatus(AccountStatus accountStatus) {
            this.accountStatus = accountStatus;
            return this;
        }

        public UserBuilder deleteScheduledAt(LocalDateTime deleteScheduledAt) {
            this.deleteScheduledAt = deleteScheduledAt;
            return this;
        }

        public UserBuilder banReason(String banReason) {
            this.banReason = banReason;
            return this;
        }

        public User build() {
            return new User(id, firstName, lastName, email, password, role, enabled, avatarUrl, phone, lastLoginAt,
                    roles, createdAt, updatedAt, deletedAt, userCode, accountStatus, deleteScheduledAt, banReason);
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

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Set<UserRole> getRoles() {
        return roles;
    }

    public void setRoles(Set<UserRole> roles) {
        this.roles = roles;
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

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
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

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public void addRole(RoleType roleType) {
        UserRole userRole = UserRole.builder()
                .user(this)
                .role(roleType)
                .build();
        this.roles.add(userRole);
    }

    public boolean hasRole(RoleType roleType) {
        return roles.stream().anyMatch(r -> r.getRole() == roleType);
    }

    @jakarta.persistence.PrePersist
    public void prePersist() {
        if (this.userCode == null || this.userCode.isEmpty()) {
            this.userCode = java.util.UUID.randomUUID().toString();
        }
        if (this.accountStatus == null) {
            this.accountStatus = AccountStatus.ACTIVE;
        }
    }
}
