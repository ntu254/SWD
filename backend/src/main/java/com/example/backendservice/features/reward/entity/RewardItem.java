package com.example.backendservice.features.reward.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reward_items")
@Entity
@Table(name = "reward_items")
public class RewardItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(name = "stock", nullable = false)
    private Integer stock = 0;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "status")
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public RewardItem() {
    }

    public RewardItem(UUID id, String name, String description, Integer pointsCost, Integer stock, String imageUrl,
            String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.pointsCost = pointsCost;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RewardItemBuilder builder() {
        return new RewardItemBuilder();
    }

    public static class RewardItemBuilder {
        private UUID id;
        private String name;
        private String description;
        private Integer pointsCost;
        private Integer stock = 0;
        private String imageUrl;
        private String status = "ACTIVE";
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RewardItemBuilder() {
        }

        public RewardItemBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public RewardItemBuilder name(String name) {
            this.name = name;
            return this;
        }

        public RewardItemBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RewardItemBuilder pointsCost(Integer pointsCost) {
            this.pointsCost = pointsCost;
            return this;
        }

        public RewardItemBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public RewardItemBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public RewardItemBuilder status(String status) {
            this.status = status;
            return this;
        }

        public RewardItemBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RewardItemBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RewardItem build() {
            return new RewardItem(id, name, description, pointsCost, stock, imageUrl, status, createdAt, updatedAt);
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getPointsCost() {
        return pointsCost;
    }

    public void setPointsCost(Integer pointsCost) {
        this.pointsCost = pointsCost;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
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
