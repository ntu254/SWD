package com.example.backendservice.features.reward.repository;

import java.util.UUID;

public interface LeaderboardProjection {
    UUID getUserId();

    String getFirstName();

    String getLastName();

    Double getTotalPoints();
}

