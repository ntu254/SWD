package com.wastecollection.dto.reward;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RewardItemDto {
    private UUID itemId;
    private String name;
    private String description;
    private String imageUrl;
    private Integer pointsCost;
    private Integer stock;
    private Boolean isActive;
}
