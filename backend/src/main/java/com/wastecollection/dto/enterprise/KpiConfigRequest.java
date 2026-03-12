package com.wastecollection.dto.enterprise;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class KpiConfigRequest {
    @NotNull(message = "Collector user ID is required")
    private UUID collectorUserId;

    @NotNull(message = "Area ID is required")
    private UUID areaId;

    /** Minimum number of collection visits per day */
    private Integer minVisits;

    /** Minimum total weight (kg) per day */
    private Double minWeightKg;

    /** KPI date; defaults to today if omitted */
    private LocalDate kpiDate;
}
