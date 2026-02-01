package com.example.backendservice.features.user.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "citizen_profiles")
@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CitizenProfile extends User {

    @Column(name = "address")
    private String address;

    @Column(name = "current_points")
    @Builder.Default
    private Integer currentPoints = 0;

    @Column(name = "membership_tier")
    @Builder.Default
    private String membershipTier = "Bronze"; // Bronze, Silver, Gold

    // Helper method to get userId
    public UUID getUserId() {
        return this.getId();
    }
}
