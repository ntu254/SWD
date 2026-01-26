package com.example.backendservice.features.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "citizens")
public class Citizen {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "address")
    private String address;

    @Column(name = "current_points")
    private Integer currentPoints = 0;

    @Column(name = "membership_tier")
    private String membershipTier = "Bronze"; // Bronze, Silver, Gold

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Citizen() {
    }

    public Citizen(UUID id, User user, String address, Integer currentPoints, String membershipTier,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.user = user;
        this.address = address;
        this.currentPoints = currentPoints != null ? currentPoints : 0;
        this.membershipTier = membershipTier != null ? membershipTier : "Bronze";
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static CitizenBuilder builder() {
        return new CitizenBuilder();
    }

    public static class CitizenBuilder {
        private UUID id;
        private User user;
        private String address;
        private Integer currentPoints = 0;
        private String membershipTier = "Bronze";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        CitizenBuilder() {
        }

        public CitizenBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public CitizenBuilder user(User user) {
            this.user = user;
            return this;
        }

        public CitizenBuilder address(String address) {
            this.address = address;
            return this;
        }

        public CitizenBuilder currentPoints(Integer currentPoints) {
            this.currentPoints = currentPoints;
            return this;
        }

        public CitizenBuilder membershipTier(String membershipTier) {
            this.membershipTier = membershipTier;
            return this;
        }

        public CitizenBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public CitizenBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Citizen build() {
            return new Citizen(id, user, address, currentPoints, membershipTier, createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getCurrentPoints() {
        return currentPoints;
    }

    public void setCurrentPoints(Integer currentPoints) {
        this.currentPoints = currentPoints;
    }

    public String getMembershipTier() {
        return membershipTier;
    }

    public void setMembershipTier(String membershipTier) {
        this.membershipTier = membershipTier;
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

    // Helper method to get userId
    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }
}
