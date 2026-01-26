package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class UpdateRewardItemRequest {

    private String name;

    private String description;

    @Min(value = 1, message = "Points cost must be greater than 0")
    private Integer pointsCost;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private String imageUrl;

    private String status; // ACTIVE, INACTIVE

    public UpdateRewardItemRequest() {
    }

    public UpdateRewardItemRequest(String name, String description, Integer pointsCost, Integer stock, String imageUrl,
            String status) {
        this.name = name;
        this.description = description;
        this.pointsCost = pointsCost;
        this.stock = stock;
        this.imageUrl = imageUrl;
        this.status = status;
    }

    public static UpdateRewardItemRequestBuilder builder() {
        return new UpdateRewardItemRequestBuilder();
    }

    public static class UpdateRewardItemRequestBuilder {
        private String name;
        private String description;
        private Integer pointsCost;
        private Integer stock;
        private String imageUrl;
        private String status;

        UpdateRewardItemRequestBuilder() {
        }

        public UpdateRewardItemRequestBuilder name(String name) {
            this.name = name;
            return this;
        }

        public UpdateRewardItemRequestBuilder description(String description) {
            this.description = description;
            return this;
        }

        public UpdateRewardItemRequestBuilder pointsCost(Integer pointsCost) {
            this.pointsCost = pointsCost;
            return this;
        }

        public UpdateRewardItemRequestBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public UpdateRewardItemRequestBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public UpdateRewardItemRequestBuilder status(String status) {
            this.status = status;
            return this;
        }

        public UpdateRewardItemRequest build() {
            return new UpdateRewardItemRequest(name, description, pointsCost, stock, imageUrl, status);
        }
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
}
