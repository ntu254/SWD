package com.example.backendservice.features.reward.dto;

import com.example.backendservice.features.reward.entity.RewardItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
