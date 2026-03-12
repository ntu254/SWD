package com.wastecollection.dto.enterprise;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class EnterpriseCapabilityDto {
    private UUID capabilityId;
    private UUID enterpriseUserId;
    private UUID serviceAreaId;
    private String serviceAreaName;
    private UUID wasteTypeId;
    private String wasteTypeName;
    private Double dailyCapacityKg;
    private Double usedCapacityKg;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
}
