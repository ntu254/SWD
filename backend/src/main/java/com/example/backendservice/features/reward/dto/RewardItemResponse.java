package com.example.backendservice.features.reward.dto;

import com.example.backendservice.features.reward.entity.RewardItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class RewardItemResponse {

    private UUID id;
    private String name;
    private String description;
    private Integer pointsCost;
    private Integer stock;
    private String imageUrl;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RewardItemResponse() {
    }

    public RewardItemResponse(UUID id, String name, String description, Integer pointsCost, Integer stock,
            String imageUrl, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
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

    public static RewardItemResponseBuilder builder() {
        return new RewardItemResponseBuilder();
    }

    public static class RewardItemResponseBuilder {
        private UUID id;
        private String name;
        private String description;
        private Integer pointsCost;
        private Integer stock;
        private String imageUrl;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        RewardItemResponseBuilder() {
        }

        public RewardItemResponseBuilder id(UUID id) {
            this.id = id;
            return this;
        }

        public RewardItemResponseBuilder name(String name) {
            this.name = name;
            return this;
        }

        public RewardItemResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public RewardItemResponseBuilder pointsCost(Integer pointsCost) {
            this.pointsCost = pointsCost;
            return this;
        }

        public RewardItemResponseBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public RewardItemResponseBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public RewardItemResponseBuilder status(String status) {
            this.status = status;
            return this;
        }

        public RewardItemResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RewardItemResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public RewardItemResponse build() {
            return new RewardItemResponse(id, name, description, pointsCost, stock, imageUrl, status, createdAt,
                    updatedAt);
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

    public static RewardItemResponse fromEntity(RewardItem entity) {
        return RewardItemResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .pointsCost(entity.getPointsCost())
                .stock(entity.getStock())
                .imageUrl(entity.getImageUrl())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
