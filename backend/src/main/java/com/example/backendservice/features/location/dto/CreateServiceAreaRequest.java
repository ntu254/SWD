package com.example.backendservice.features.location.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceAreaRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Ward code is required")
    private String wardCode;

    @NotBlank(message = "District code is required")
    private String districtCode;

    @NotBlank(message = "City is required")
    private String city;

    private String geoPolygon;
}
