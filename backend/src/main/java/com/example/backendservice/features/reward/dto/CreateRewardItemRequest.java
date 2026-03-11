package com.example.backendservice.features.reward.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRewardItemRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    private String description;

    @NotNull(message = "Points cost is required")
    @PositiveOrZero(message = "Points cost must be 0 or greater")
    private Integer pointsCost;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock must be 0 or greater")
    private Integer stock;

    private String imageUrl;
}
