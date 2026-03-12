package com.wastecollection.dto.enterprise;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class KpiConfigDto {
    private UUID kpiId;
    private UUID collectorUserId;
    private String collectorName;
    private UUID areaId;
    private String areaName;
    private LocalDate kpiDate;
    private Integer minVisits;
    private Integer actualVisits;
    private Double minWeightKg;
    private Double actualWeightKg;
    /** PENDING, MET, NOT_MET */
    private String status;
}
