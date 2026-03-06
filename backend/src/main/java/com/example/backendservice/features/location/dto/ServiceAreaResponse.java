package com.example.backendservice.features.location.dto;

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
public class ServiceAreaResponse {
    private UUID areaId;
    private String name;
    private String wardCode;
    private String districtCode;
    private String city;
    private String geoPolygon;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
