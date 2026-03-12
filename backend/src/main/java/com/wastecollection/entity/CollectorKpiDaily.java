package com.wastecollection.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "collector_kpi_daily")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectorKpiDaily {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "kpi_id")
    private UUID kpiId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collector_user_id", nullable = false)
    private User collector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id", nullable = false)
    private ServiceArea area;

    @Column(name = "kpi_date", nullable = false)
    private LocalDate kpiDate;

    @Column(name = "min_visits")
    private Integer minVisits;

    @Column(name = "actual_visits")
    private Integer actualVisits;

    @Column(name = "min_weight_kg")
    private Double minWeightKg;

    @Column(name = "actual_weight_kg")
    private Double actualWeightKg;

    @Column(name = "status")
    private String status;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
