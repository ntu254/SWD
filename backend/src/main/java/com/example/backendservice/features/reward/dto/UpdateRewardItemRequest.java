package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRewardItemRequest {

    private String name;

    private String description;

    @Min(value = 1, message = "Points cost must be greater than 0")
    private Integer pointsCost;

    @Min(value = 0, message = "Stock cannot be negative")
    private Integer stock;

    private String imageUrl;

    private String status; // ACTIVE, INACTIVE
}
