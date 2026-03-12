package com.wastecollection.dto.enterprise;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateCapabilityRequest {

    @NotNull
    private UUID serviceAreaId;

    @NotNull
    private UUID wasteTypeId;

    @NotNull
    private Double dailyCapacityKg;

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
