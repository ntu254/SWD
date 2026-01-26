package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class CreateRewardItemRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Points cost is required")
    @Min(value = 1, message = "Points cost must be greater than 0")
    private Integer pointsCost;

    @NotNull(message = "Stock is required")
    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private String imageUrl;

    public CreateRewardItemRequest() {
    }

    public CreateRewardItemRequest(String name, String description, Integer pointsCost, Integer stock,
            String imageUrl) {
        this.name = name;
        this.description = description;
        this.pointsCost = pointsCost;
        this.stock = stock;
        this.imageUrl = imageUrl;
    }

    public static CreateRewardItemRequestBuilder builder() {
        return new CreateRewardItemRequestBuilder();
    }

    public static class CreateRewardItemRequestBuilder {
        private String name;
        private String description;
        private Integer pointsCost;
        private Integer stock;
        private String imageUrl;

        CreateRewardItemRequestBuilder() {
        }

        public CreateRewardItemRequestBuilder name(String name) {
            this.name = name;
            return this;
        }

        public CreateRewardItemRequestBuilder description(String description) {
            this.description = description;
            return this;
        }

        public CreateRewardItemRequestBuilder pointsCost(Integer pointsCost) {
            this.pointsCost = pointsCost;
            return this;
        }

        public CreateRewardItemRequestBuilder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public CreateRewardItemRequestBuilder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public CreateRewardItemRequest build() {
            return new CreateRewardItemRequest(name, description, pointsCost, stock, imageUrl);
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
}
