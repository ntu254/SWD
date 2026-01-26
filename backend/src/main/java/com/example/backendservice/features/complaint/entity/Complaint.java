package com.example.backendservice.features.complaint.entity;

import com.example.backendservice.features.user.entity.Citizen;
import com.example.backendservice.features.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "complaints")
@Entity
@Table(name = "complaints")
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "citizen_id", nullable = false)
    private Citizen citizen;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    private String category = "OTHER";

    @Column(name = "status")
    private String status = "Pending";

    @Column(name = "priority")
    private String priority = "Normal";

    @Column(name = "admin_response", columnDefinition = "TEXT")
    private String adminResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Complaint() {
    }

    public Complaint(UUID id, Citizen citizen, String title, String description, String category, String status,
            String priority, String adminResponse, User resolvedBy, LocalDateTime resolvedAt, LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this.id = id;
        this.citizen = citizen;
        this.title = title;
        this.description = description;
        this.category = category;
        this.status = status;
        this.priority = priority;
        this.adminResponse = adminResponse;
        this.resolvedBy = resolvedBy;
        this.resolvedAt = resolvedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ComplaintBuilder builder() {
        return new ComplaintBuilder();
    }

    public static class ComplaintBuilder {
        private UUID id;
        private Citizen citizen;
        private String title;
        private String description;
        private String category = "OTHER";
        private String status = "Pending";
        private String priority = "Normal";
        private String adminResponse;
        private User resolvedBy;
        private LocalDateTime resolvedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ComplaintBuilder() {
        }

        public ComplaintBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public ComplaintBuilder citizen(Citizen citizen) {
            this.citizen = citizen;
            return this;
        }

        public ComplaintBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ComplaintBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ComplaintBuilder category(String category) {
            this.category = category;
            return this;
        }

        public ComplaintBuilder status(String status) {
            this.status = status;
            return this;
        }

        public ComplaintBuilder priority(String priority) {
            this.priority = priority;
            return this;
        }

        public ComplaintBuilder adminResponse(String adminResponse) {
            this.adminResponse = adminResponse;
            return this;
        }

        public ComplaintBuilder resolvedBy(User resolvedBy) {
            this.resolvedBy = resolvedBy;
            return this;
        }

        public ComplaintBuilder resolvedAt(LocalDateTime resolvedAt) {
            this.resolvedAt = resolvedAt;
            return this;
        }

        public ComplaintBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ComplaintBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Complaint build() {
            return new Complaint(id, citizen, title, description, category, status, priority, adminResponse, resolvedBy,
                    resolvedAt, createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Citizen getCitizen() {
        return citizen;
    }

    public void setCitizen(Citizen citizen) {
        this.citizen = citizen;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public User getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(User resolvedBy) {
        this.resolvedBy = resolvedBy;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
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
}
