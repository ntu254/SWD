package com.wastecollection.dto.reward;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RewardItemDto {
    private UUID itemId;

    @NotBlank(message = "Reward item name is required")
    private String name;

    private String description;
    private String imageUrl;

    @NotNull(message = "Points cost is required")
    @Positive(message = "Points cost must be greater than 0")
    private Integer pointsCost;

    @NotNull(message = "Stock is required")
    @PositiveOrZero(message = "Stock must be 0 or greater")
    private Integer stock;

    @NotNull(message = "Active state is required")
    private Boolean isActive;
}
