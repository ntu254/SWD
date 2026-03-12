package com.wastecollection.dto.reward;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LeaderboardEntryDto {
    private int rank;
    private UUID citizenUserId;
    private String displayName;
    private String avatarUrl;
    private Integer points;
}
