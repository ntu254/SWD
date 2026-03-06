package com.example.backendservice.features.settings.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingDTO {
    private String key;
    private String value;
    private String description;
    private String dataType;
}
