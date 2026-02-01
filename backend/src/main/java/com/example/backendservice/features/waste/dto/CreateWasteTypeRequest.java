package com.example.backendservice.features.waste.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateWasteTypeRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must be less than 100 characters")
    private String name;

    @Size(max = 100, message = "Vietnamese name must be less than 100 characters")
    private String nameVi;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private String iconUrl;
    private String colorCode;

    @Positive(message = "Base points per kg must be positive")
    private Double basePointsPerKg;
}
