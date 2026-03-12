package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "enterprise_capabilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseCapability {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "capability_id")
    private UUID capabilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enterprise_user_id", nullable = false)
    private User enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_area_id", nullable = false)
    private ServiceArea serviceArea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "waste_type_id", nullable = false)
    private WasteType wasteType;

    @Column(name = "daily_capacity_kg", nullable = false)
    private Double dailyCapacityKg;

    @Column(name = "used_capacity_kg")
    private Double usedCapacityKg;

    @Column(name = "effective_from")
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;
}
